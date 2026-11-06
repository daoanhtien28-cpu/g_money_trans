import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BanksService } from '../banks/banks.service';
import { AccountCategory, AccountDocument } from '../accounts/schemas/account.schema';
import { AccountsService } from '../accounts/accounts.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  QueryTransactionsDto,
  TransactionSearchType,
  TransactionSortOrder,
  TransactionTypeFilter,
} from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionDocument, TransactionStatus } from './schemas/transaction.schema';
import {
  InternationalTransaction,
  InternationalTransactionDocument,
  InternationalTransactionStatus,
} from './schemas/international-transaction.schema';
import {
  DomesticTransaction,
  DomesticTransactionDocument,
  DomesticSourceType,
  DomesticTransactionStatus,
} from './schemas/domestic-transaction.schema';
import {
  LinkedBankTransaction,
  LinkedBankTransactionDocument,
  BankTransactionDirection,
  LinkedBankTransactionStatus,
} from './schemas/linked-bank-transaction.schema';
import { QueryInternationalTransactionsDto } from './dto/query-international-transactions.dto';
import { CreateInternationalTransactionDto } from './dto/create-international-transaction.dto';
import { UpdateInternationalTransactionDto } from './dto/update-international-transaction.dto';
import { QueryDomesticTransactionsDto } from './dto/query-domestic-transactions.dto';
import { CreateDomesticTransactionDto } from './dto/create-domestic-transaction.dto';
import { UpdateDomesticTransactionDto } from './dto/update-domestic-transaction.dto';
import { QueryLinkedBankTransactionsDto } from './dto/query-linked-bank-transactions.dto';
import { CreateLinkedBankTransactionDto } from './dto/create-linked-bank-transaction.dto';
import { UpdateLinkedBankTransactionDto } from './dto/update-linked-bank-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly accountsService: AccountsService,
    private readonly banksService: BanksService,
    @InjectModel(InternationalTransaction.name)
    private readonly intlTxnModel: Model<InternationalTransactionDocument>,
    @InjectModel(DomesticTransaction.name)
    private readonly domesticTxnModel: Model<DomesticTransactionDocument>,
    @InjectModel(LinkedBankTransaction.name)
    private readonly linkedBankTxnModel: Model<LinkedBankTransactionDocument>,
  ) { }

  /**
   * Lấy danh sách giao dịch có bộ lọc và phân trang.
   */
  async getTransactions(userId: string, query: QueryTransactionsDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    // 1. Lọc theo loại giao dịch (전체 / 입금 / 출금)
    if (query.type === TransactionTypeFilter.DEPOSIT) {
      filter.isDeposit = true;
    } else if (query.type === TransactionTypeFilter.WITHDRAWAL) {
      filter.isDeposit = false;
    }

    // 2. Lọc theo thời gian thực tế của giao dịch (transferTime: YYYY.MM.DD)
    let startFilterTime: string | null = null;
    let endFilterTime: string | null = null;

    if (query.startDate || query.endDate) {
      // Ưu tiên ngày do người dùng chỉ định trực tiếp (직접입력)
      if (query.startDate) {
        startFilterTime = this.normalizeDateStr(query.startDate);
      }
      if (query.endDate) {
        endFilterTime = this.normalizeDateStr(query.endDate);
      }
    } else if (
      query.period &&
      query.period !== 'ALL' &&
      query.period !== 'CUSTOM'
    ) {
      // Lọc theo mốc thời gian nhanh (1M, 3M, 6M, 1Y)
      startFilterTime = this.getPeriodStartDate(query.period);
    }

    if (startFilterTime || endFilterTime) {
      const timeFilter: Record<string, string> = {};
      if (startFilterTime) {
        timeFilter.$gte = startFilterTime;
      }
      if (endFilterTime) {
        timeFilter.$lte = endFilterTime;
      }
      filter.transferTime = timeFilter;
    }

    // 3. Tìm kiếm từ khóa (예금주명 / 메모)
    if (query.keyword && query.keyword.trim()) {
      const keyword = query.keyword.trim();
      const regex = new RegExp(keyword, 'i');

      if (query.searchType === TransactionSearchType.HOLDER) {
        filter.$or = [
          { title: regex },
          { 'beneficiaryBank.accountName': regex },
          { 'paymentBank.accountName': regex },
        ];
      } else if (query.searchType === TransactionSearchType.MEMO) {
        filter.content = regex;
      } else {
        filter.$or = [
          { title: regex },
          { content: regex },
          { 'beneficiaryBank.accountName': regex },
        ];
      }
    }

    // 4. Lọc theo khoảng số tiền giao dịch (minAmount, maxAmount)
    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      const amountFilter: Record<string, number> = {};
      if (query.minAmount !== undefined && !isNaN(Number(query.minAmount))) {
        amountFilter.$gte = Number(query.minAmount);
      }
      if (query.maxAmount !== undefined && !isNaN(Number(query.maxAmount))) {
        amountFilter.$lte = Number(query.maxAmount);
      }
      if (Object.keys(amountFilter).length > 0) {
        filter.transferAmount = amountFilter;
      }
    }

    // 5. Thứ tự sắp xếp (최신순 / 과거순) - theo thời gian giao dịch thực tế
    const sortDirection: 1 | -1 =
      query.sortOrder === TransactionSortOrder.OLDEST ? 1 : -1;
    const sort: Record<string, 1 | -1> = {
      transferTime: sortDirection,
      transferTimeDetail: sortDirection,
      createdAt: sortDirection,
    };

    const [items, total] = await Promise.all([
      this.transactionsRepo.findWithPagination(filter, sort, skip, limit),
      this.transactionsRepo.count(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Lấy chi tiết một giao dịch.
   */
  async getTransactionById(userId: string, id: string): Promise<TransactionDocument> {
    const tx = await this.transactionsRepo.findById(id);
    if (!tx) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }
    if (tx.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập giao dịch này');
    }
    return tx;
  }

  /**
   * Tạo giao dịch mới (tự động cập nhật số dư ví).
   */
  async createTransaction(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    const targetId = dto.accountId || dto.walletId;
    const wallet = targetId
      ? await this.accountsService.getAccountById(userId, targetId)
      : await this.accountsService.getActiveAccount(userId);
    const isDeposit = dto.isDeposit ?? false;
    const fee = dto.fee ?? 0;
    const totalRequired = isDeposit ? 0 : dto.transferAmount + fee;

    if (!isDeposit && wallet.availableBalance < totalRequired) {
      throw new BadRequestException('Số dư khả dụng trong ví không đủ để thực hiện giao dịch');
    }

    // Tính toán số dư mới
    const delta = isDeposit ? dto.transferAmount : -totalRequired;
    const newAvailableBalance = Math.max(0, wallet.availableBalance + delta);
    const newTotalBalance = Math.max(0, wallet.totalBalance + delta);

    // Cập nhật số dư ví
    await this.accountsService.updateAccount(userId, wallet.id, {
      availableBalance: newAvailableBalance,
      availableBalanceEdit: newAvailableBalance,
      totalBalance: newTotalBalance,
    });

    // Xác định thông tin ngân hàng nhận
    let receiverBankName = dto.receiverBankName || '국민은행';
    let receiverImageUrl = 'assets/images/bank/bank_kb.png';
    let receiverBankCode = dto.receiverBankCode || 'KB';

    if (dto.receiverBankCode) {
      try {
        const bank = await this.banksService.getBankByCode(dto.receiverBankCode);
        receiverBankName = bank.name;
        receiverImageUrl = bank.imageUrl;
        receiverBankCode = bank.code;
      } catch (_) { }
    }

    // Tạo mã giao dịch & thời gian theo giờ chuẩn KST (UTC+9)
    const now = new Date();
    const kstTime = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000;
    const kstDate = new Date(kstTime);
    const defaultDateStr = `${kstDate.getFullYear()}.${String(kstDate.getMonth() + 1).padStart(2, '0')}.${String(kstDate.getDate()).padStart(2, '0')}`;
    const defaultTimeStr = `${String(kstDate.getHours()).padStart(2, '0')}:${String(kstDate.getMinutes()).padStart(2, '0')}:${String(kstDate.getSeconds()).padStart(2, '0')}`;

    const dateStr = dto.transferTime
      ? (this.normalizeDateStr(dto.transferTime) || defaultDateStr)
      : defaultDateStr;
    const timeStr = dto.transferTimeDetail || defaultTimeStr;
    const transferNumber = `1128OTT${Date.now().toString().slice(-9)}`;

    return this.transactionsRepo.save({
      userId: new Types.ObjectId(userId),
      accountId: new Types.ObjectId(wallet.id),
      walletId: new Types.ObjectId(wallet.id),
      transferNumber: dto.transferNumber || transferNumber,
      transferChannel: dto.transferChannel || 'Sh 수협',
      transferTypeTag: dto.transferTypeTag || (isDeposit ? '입금' : '체크'),
      title: dto.title,
      content: dto.content || '',
      isDeposit,
      currency: dto.currency || wallet.currency || 'KRW',
      transferAmount: dto.transferAmount,
      fee,
      balanceAfter: dto.balanceAfter ?? newAvailableBalance,
      totalWithdrawalAmount: dto.totalWithdrawalAmount ?? (dto.balanceAfter ?? newAvailableBalance),
      status: (dto.status as TransactionStatus) || TransactionStatus.SUCCESS,
      paymentBank: dto.paymentBank || {
        bankCode: wallet.linkedBankCode || 'SH',
        name: wallet.linkedBankName || '수협',
        imageUrl: wallet.imageUrl || 'assets/images/bank/bank_suhyup.png',
        accountNumber: wallet.accountNumber,
        accountName: wallet.ownerName,
      },
      beneficiaryBank: dto.beneficiaryBank || {
        bankCode: receiverBankCode,
        name: receiverBankName,
        imageUrl: receiverImageUrl,
        accountNumber: dto.receiverAccountNumber || '9876 543 210',
        accountName: dto.receiverName || dto.title,
      },
      transferTime: dateStr,
      transferTimeDetail: timeStr,
    });
  }

  /**
   * Cập nhật thông tin giao dịch (cho phép sửa tất cả thông tin và tự động bù trừ số dư ví).
   */
  async updateTransaction(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionDocument> {
    const tx = await this.getTransactionById(userId, id);
    let wallet: AccountDocument;
    const targetId = tx.accountId || tx.walletId;
    if (targetId) {
      try {
        wallet = await this.accountsService.getAccountById(userId, targetId.toString());
      } catch (_) {
        wallet = await this.accountsService.getActiveAccount(userId);
      }
    } else {
      wallet = await this.accountsService.getActiveAccount(userId);
    }

    // 1. Kiểm tra và tính toán bù trừ số dư nếu thay đổi số tiền, loại giao dịch hoặc phí
    const willChangeAmount =
      dto.transferAmount !== undefined && dto.transferAmount !== tx.transferAmount;
    const willChangeDeposit =
      dto.isDeposit !== undefined && dto.isDeposit !== tx.isDeposit;
    const willChangeFee = dto.fee !== undefined && dto.fee !== tx.fee;

    if (willChangeAmount || willChangeDeposit || willChangeFee) {
      const oldAmount = tx.transferAmount;
      const oldFee = tx.fee || 0;
      const oldContribution = tx.isDeposit ? oldAmount : -(oldAmount + oldFee);

      const newAmount = dto.transferAmount ?? tx.transferAmount;
      const newIsDeposit = dto.isDeposit ?? tx.isDeposit;
      const newFee = dto.fee !== undefined ? dto.fee : oldFee;
      const newContribution = newIsDeposit ? newAmount : -(newAmount + newFee);

      const delta = newContribution - oldContribution;
      const projectedBalance = wallet.availableBalance + delta;

      // Nếu số dư sau điều chỉnh < 0 thì KHÔNG cho sửa, ném lỗi 400
      if (projectedBalance < 0) {
        throw new BadRequestException(
          `Số dư ví không đủ để điều chỉnh giao dịch này. Số dư hiện tại: ${wallet.availableBalance} KRW, mức điều chỉnh cần thêm: ${Math.abs(delta)} KRW.`,
        );
      }

      await this.accountsService.updateAccount(userId, wallet.id, {
        availableBalance: projectedBalance,
        availableBalanceEdit: projectedBalance,
        totalBalance: Math.max(0, wallet.totalBalance + delta),
      });

      dto.balanceAfter = projectedBalance;
      dto.totalWithdrawalAmount = projectedBalance;
    }

    // 2. Nếu đổi mã ngân hàng nhận receiverBankCode, tự động cập nhật beneficiaryBank
    if (dto.receiverBankCode) {
      try {
        const bank = await this.banksService.getBankByCode(dto.receiverBankCode);
        if (!dto.beneficiaryBank) {
          dto.beneficiaryBank = {
            bankCode: bank.code,
            name: bank.name,
            imageUrl: bank.imageUrl,
            accountNumber:
              dto.receiverAccountNumber ||
              tx.beneficiaryBank?.accountNumber ||
              '9876 543 210',
            accountName:
              dto.receiverName ||
              dto.title ||
              tx.beneficiaryBank?.accountName ||
              tx.title,
          };
        } else {
          dto.beneficiaryBank.bankCode = bank.code;
          dto.beneficiaryBank.name = bank.name;
          dto.beneficiaryBank.imageUrl = bank.imageUrl;
        }
      } catch (_) { }
    }

    // Chuẩn hóa định dạng ngày nếu người dùng chỉnh sửa transferTime
    if (dto.transferTime) {
      dto.transferTime = this.normalizeDateStr(dto.transferTime) || dto.transferTime;
    }

    // 3. Cập nhật tất cả thông tin vào database
    const updateData: any = { ...dto };
    if (dto.accountId) {
      updateData.accountId = new Types.ObjectId(dto.accountId);
    }
    if (dto.walletId) {
      updateData.walletId = new Types.ObjectId(dto.walletId);
    }
    const updated = await this.transactionsRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }
    return updated;
  }

  /**
   * Xóa một giao dịch (không hoàn tác số dư ví).
   */
  async deleteTransaction(userId: string, id: string): Promise<{ message: string }> {
    await this.getTransactionById(userId, id);
    await this.transactionsRepo.delete(id);
    return { message: 'Xóa giao dịch thành công' };
  }

  /**
   * Chuẩn hóa chuỗi ngày thành định dạng YYYY.MM.DD đồng nhất.
   */
  private normalizeDateStr(val?: string): string | null {
    if (!val) return null;
    const cleaned = val.trim().replace(/[-/]/g, '.');
    const parts = cleaned.split('.');
    if (parts.length === 3) {
      const y = parts[0].padStart(4, '0');
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}.${m}.${d}`;
    }
    return cleaned;
  }

  /**
   * Tính ngày bắt đầu theo mốc thời gian (KST - Asia/Seoul UTC+9).
   */
  private getPeriodStartDate(period: string): string | null {
    const now = new Date();
    const kstTime = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000;
    const kstDate = new Date(kstTime);

    if (period === '1M') {
      kstDate.setMonth(kstDate.getMonth() - 1);
    } else if (period === '3M') {
      kstDate.setMonth(kstDate.getMonth() - 3);
    } else if (period === '6M') {
      kstDate.setMonth(kstDate.getMonth() - 6);
    } else if (period === '1Y') {
      kstDate.setFullYear(kstDate.getFullYear() - 1);
    } else {
      return null;
    }

    const y = kstDate.getFullYear();
    const m = String(kstDate.getMonth() + 1).padStart(2, '0');
    const d = String(kstDate.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }

  // =========================================================================
  // 1. GET /internal-transaction – Lịch sử chuyển tiền quốc tế (Chỉ GmoneyPay)
  // =========================================================================
  async getInternationalTransactions(
    userId: string,
    query: QueryInternationalTransactionsDto,
  ) {
    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      const timeFilter: Record<string, any> = {};
      if (query.startDate) {
        timeFilter.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        timeFilter.$lte = end;
      }
      filter.transferTime = timeFilter;
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    let [items, total] = await Promise.all([
      this.intlTxnModel
        .find(filter)
        .sort({ transferTime: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.intlTxnModel.countDocuments(filter).exec(),
    ]);

    // Seed mẫu nếu người dùng chưa có giao dịch nào
    if (total === 0 && !query.status && !query.startDate && !query.endDate) {
      await this.seedDefaultInternationalTransactions(userId);
      [items, total] = await Promise.all([
        this.intlTxnModel
          .find(filter)
          .sort({ transferTime: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.intlTxnModel.countDocuments(filter).exec(),
      ]);
    }

    return {
      items,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async seedDefaultInternationalTransactions(userId: string): Promise<void> {
    const overview = await this.accountsService.getAccountOverview(userId);
    const payNumber = overview?.gmoneyPay?.accountNumber || 'GMP-KRW-882910';

    await this.intlTxnModel.create([
      {
        userId: new Types.ObjectId(userId),
        sourceAccountType: 'GMONEY_PAY',
        sourceAccountNumber: payNumber,
        senderName: 'DAO ANH TIEN',
        senderPhone: '01012345678',
        recipientName: 'NGUYEN VAN A',
        recipientAccountNumber: '19036782910123',
        recipientBankCode: 'TCB',
        recipientBankName: 'Techcombank',
        recipientCountry: 'VN',
        sendAmount: 1000000,
        sendCurrency: 'KRW',
        receiveAmount: 18250000,
        receiveCurrency: 'VND',
        exchangeRate: 18.25,
        transferFee: 5000,
        conversionFee: 2000,
        totalDebited: 1007000,
        status: InternationalTransactionStatus.SUCCESS,
        transferTime: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        userId: new Types.ObjectId(userId),
        sourceAccountType: 'GMONEY_PAY',
        sourceAccountNumber: payNumber,
        senderName: 'DAO ANH TIEN',
        senderPhone: '01012345678',
        recipientName: 'TRAN THI B',
        recipientAccountNumber: '0071001234567',
        recipientBankCode: 'VCB',
        recipientBankName: 'Vietcombank',
        recipientCountry: 'VN',
        sendAmount: 500000,
        sendCurrency: 'KRW',
        receiveAmount: 9125000,
        receiveCurrency: 'VND',
        exchangeRate: 18.25,
        transferFee: 5000,
        conversionFee: 1000,
        totalDebited: 506000,
        status: InternationalTransactionStatus.SUCCESS,
        transferTime: new Date(Date.now() - 48 * 3600 * 1000),
      },
    ]);
  }

  // =========================================================================
  // 2. GET /domestic-transaction – Lịch sử chuyển tiền nội địa (GmoneyPay & Wallet)
  // =========================================================================
  async getDomesticTransactions(
    userId: string,
    query: QueryDomesticTransactionsDto,
  ) {
    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.sourceType) {
      filter.sourceType = query.sourceType;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      const timeFilter: Record<string, any> = {};
      if (query.startDate) {
        timeFilter.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        timeFilter.$lte = end;
      }
      filter.transferTime = timeFilter;
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    let [items, total] = await Promise.all([
      this.domesticTxnModel
        .find(filter)
        .sort({ transferTime: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.domesticTxnModel.countDocuments(filter).exec(),
    ]);

    if (total === 0 && !query.status && !query.startDate && !query.endDate && !query.sourceType) {
      await this.seedDefaultDomesticTransactions(userId);
      [items, total] = await Promise.all([
        this.domesticTxnModel
          .find(filter)
          .sort({ transferTime: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.domesticTxnModel.countDocuments(filter).exec(),
      ]);
    }

    return {
      items,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async seedDefaultDomesticTransactions(userId: string): Promise<void> {
    const overview = await this.accountsService.getAccountOverview(userId);
    const wallet = overview?.gmoneyWallet;
    const pay = overview?.gmoneyPay;

    await this.domesticTxnModel.create([
      {
        userId: new Types.ObjectId(userId),
        sourceType: DomesticSourceType.GMONEY_WALLET,
        sourceAccountId: wallet?.id ? new Types.ObjectId(wallet.id) : undefined,
        sourceAccountNumber: wallet?.accountNumber || 'GMW-KRW-550192',
        recipientName: 'KIM MIN SOO',
        recipientAccountNumber: '110482910293',
        recipientBankCode: 'SHINHAN',
        recipientBankName: 'Shinhan Bank',
        amount: 150000,
        fee: 0,
        currency: 'KRW',
        message: 'Tien an trua',
        status: DomesticTransactionStatus.SUCCESS,
        transferTime: new Date(Date.now() - 3 * 3600 * 1000),
      },
      {
        userId: new Types.ObjectId(userId),
        sourceType: DomesticSourceType.GMONEY_PAY,
        sourceAccountId: pay?.id ? new Types.ObjectId(pay.id) : undefined,
        sourceAccountNumber: pay?.accountNumber || 'GMP-KRW-882910',
        recipientName: 'LEE YOUNG HO',
        recipientAccountNumber: '3517627352193',
        recipientBankCode: 'NH',
        recipientBankName: 'NH Bank',
        amount: 50000,
        fee: 0,
        currency: 'KRW',
        message: 'Tien cafe',
        status: DomesticTransactionStatus.SUCCESS,
        transferTime: new Date(Date.now() - 24 * 3600 * 1000),
      },
    ]);
  }

  // =========================================================================
  // 3. GET /link-bank-transaction – Lịch sử giao dịch ngân hàng liên kết
  // =========================================================================
  async getLinkedBankTransactions(
    userId: string,
    query: QueryLinkedBankTransactionsDto,
  ) {
    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    const targetBank = query.linkedBankAccountId || query.bankId;
    if (targetBank) {
      if (Types.ObjectId.isValid(targetBank)) {
        filter.$or = [
          { linkedBankAccountId: new Types.ObjectId(targetBank) },
          { bankCode: targetBank.toUpperCase() },
        ];
      } else {
        filter.bankCode = targetBank.toUpperCase();
      }
    }

    if (query.direction) {
      filter.direction = query.direction;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      const timeFilter: Record<string, any> = {};
      if (query.startDate) {
        timeFilter.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        timeFilter.$lte = end;
      }
      filter.transactionTime = timeFilter;
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    let [items, total] = await Promise.all([
      this.linkedBankTxnModel
        .find(filter)
        .sort({ transactionTime: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.linkedBankTxnModel.countDocuments(filter).exec(),
    ]);

    if (
      total === 0 &&
      !query.status &&
      !query.startDate &&
      !query.endDate &&
      !targetBank &&
      !query.direction
    ) {
      await this.seedDefaultLinkedBankTransactions(userId);
      [items, total] = await Promise.all([
        this.linkedBankTxnModel
          .find(filter)
          .sort({ transactionTime: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.linkedBankTxnModel.countDocuments(filter).exec(),
      ]);
    }

    return {
      items,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async seedDefaultLinkedBankTransactions(userId: string): Promise<void> {
    const overview = await this.accountsService.getAccountOverview(userId);
    const linkedBanks = overview?.linkedBankAccounts;
    const bankAccount = linkedBanks?.[0];
    const linkedBankAccountId = bankAccount?.id
      ? new Types.ObjectId(bankAccount.id)
      : new Types.ObjectId();
    const bankCode = bankAccount?.bankCode || 'SHINHAN';
    const bankName = bankAccount?.bankName || 'Shinhan Bank';
    const accountNumber = bankAccount?.accountNumberMasked || '110614025931';

    await this.linkedBankTxnModel.create([
      {
        userId: new Types.ObjectId(userId),
        linkedBankAccountId,
        bankCode,
        bankName,
        accountNumberMasked: accountNumber,
        direction: BankTransactionDirection.OUT,
        amount: 50000,
        balanceAfter: 256901,
        currency: 'KRW',
        description: 'Nap tien vao GmoneyPay',
        status: LinkedBankTransactionStatus.SUCCESS,
        transactionTime: new Date(Date.now() - 4 * 3600 * 1000),
      },
      {
        userId: new Types.ObjectId(userId),
        linkedBankAccountId,
        bankCode,
        bankName,
        accountNumberMasked: accountNumber,
        direction: BankTransactionDirection.IN,
        amount: 300000,
        balanceAfter: 306901,
        currency: 'KRW',
        description: 'Luong thang 10',
        status: LinkedBankTransactionStatus.SUCCESS,
        transactionTime: new Date(Date.now() - 48 * 3600 * 1000),
      },
    ]);
  }

  // =========================================================================
  // CRUD BỔ SUNG CHO CHUYỂN TIỀN QUỐC TẾ (International Transactions)
  // =========================================================================
  async createInternationalTransaction(
    userId: string,
    dto: CreateInternationalTransactionDto,
  ) {
    let sourceAccountNumber = dto.sourceAccountNumber;
    if (!sourceAccountNumber) {
      const overview = await this.accountsService.getAccountOverview(userId);
      sourceAccountNumber = overview?.gmoneyPay?.accountNumber || 'GMP-KRW-882910';
    }

    const exchangeRate = dto.exchangeRate || 18.25;
    const receiveAmount =
      dto.receiveAmount || Math.round(dto.sendAmount * exchangeRate);
    const transferFee = dto.transferFee ?? 5000;
    const conversionFee = dto.conversionFee ?? 2000;
    const totalDebited = dto.sendAmount + transferFee + conversionFee;

    const created = await this.intlTxnModel.create({
      userId: new Types.ObjectId(userId),
      sourceAccountType: 'GMONEY_PAY',
      sourceAccountNumber,
      senderName: dto.senderName || 'DAO ANH TIEN',
      senderPhone: dto.senderPhone || '01012345678',
      recipientName: dto.recipientName,
      recipientAccountNumber: dto.recipientAccountNumber,
      recipientBankCode: dto.recipientBankCode,
      recipientBankName: dto.recipientBankName,
      recipientCountry: dto.recipientCountry || 'VN',
      sendAmount: dto.sendAmount,
      sendCurrency: dto.sendCurrency || 'KRW',
      receiveAmount,
      receiveCurrency: dto.receiveCurrency || 'VND',
      exchangeRate,
      transferFee,
      conversionFee,
      totalDebited,
      status: dto.status || InternationalTransactionStatus.SUCCESS,
      transferTime: dto.transferTime ? new Date(dto.transferTime) : new Date(),
    });

    return created;
  }

  async getInternationalTransactionById(userId: string, id: string) {
    const txn = await this.intlTxnModel.findById(id).exec();
    if (!txn) {
      throw new NotFoundException('Giao dịch quốc tế không tồn tại');
    }
    if (txn.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập giao dịch này');
    }
    return txn;
  }

  async updateInternationalTransaction(
    userId: string,
    id: string,
    dto: UpdateInternationalTransactionDto,
  ) {
    await this.getInternationalTransactionById(userId, id);

    const updateData: any = { ...dto };
    if (dto.transferTime) {
      updateData.transferTime = new Date(dto.transferTime);
    }
    if (dto.sendAmount !== undefined) {
      const exchangeRate = dto.exchangeRate || 18.25;
      if (!dto.receiveAmount) {
        updateData.receiveAmount = Math.round(dto.sendAmount * exchangeRate);
      }
      const transferFee = dto.transferFee ?? 5000;
      const conversionFee = dto.conversionFee ?? 2000;
      updateData.totalDebited = dto.sendAmount + transferFee + conversionFee;
    }

    const updated = await this.intlTxnModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .exec();

    return updated;
  }

  async deleteInternationalTransaction(userId: string, id: string) {
    await this.getInternationalTransactionById(userId, id);
    await this.intlTxnModel.findByIdAndDelete(id).exec();
    return { message: 'Xóa giao dịch quốc tế thành công' };
  }

  // =========================================================================
  // CRUD BỔ SUNG CHO CHUYỂN TIỀN NỘI ĐỊA (Domestic Transactions)
  // =========================================================================
  async createDomesticTransaction(
    userId: string,
    dto: CreateDomesticTransactionDto,
  ) {
    let sourceAccountNumber = dto.sourceAccountNumber;
    let sourceAccountId = dto.sourceAccountId
      ? new Types.ObjectId(dto.sourceAccountId)
      : undefined;

    if (!sourceAccountNumber) {
      const overview = await this.accountsService.getAccountOverview(userId);
      if (dto.sourceType === DomesticSourceType.GMONEY_PAY) {
        sourceAccountNumber = overview?.gmoneyPay?.accountNumber || 'GMP-KRW-882910';
        sourceAccountId = overview?.gmoneyPay?.id
          ? new Types.ObjectId(overview.gmoneyPay.id)
          : undefined;
      } else {
        sourceAccountNumber = overview?.gmoneyWallet?.accountNumber || 'GMW-KRW-550192';
        sourceAccountId = overview?.gmoneyWallet?.id
          ? new Types.ObjectId(overview.gmoneyWallet.id)
          : undefined;
      }
    }

    const created = await this.domesticTxnModel.create({
      userId: new Types.ObjectId(userId),
      sourceType: dto.sourceType || DomesticSourceType.GMONEY_WALLET,
      sourceAccountId,
      sourceAccountNumber,
      recipientName: dto.recipientName,
      recipientAccountNumber: dto.recipientAccountNumber,
      recipientBankCode: dto.recipientBankCode,
      recipientBankName: dto.recipientBankName || 'Shinhan Bank',
      amount: dto.amount,
      fee: dto.fee ?? 0,
      currency: dto.currency || 'KRW',
      message: dto.message || '',
      status: dto.status || DomesticTransactionStatus.SUCCESS,
      transferTime: dto.transferTime ? new Date(dto.transferTime) : new Date(),
    });

    return created;
  }

  async getDomesticTransactionById(userId: string, id: string) {
    const txn = await this.domesticTxnModel.findById(id).exec();
    if (!txn) {
      throw new NotFoundException('Giao dịch nội địa không tồn tại');
    }
    if (txn.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập giao dịch này');
    }
    return txn;
  }

  async updateDomesticTransaction(
    userId: string,
    id: string,
    dto: UpdateDomesticTransactionDto,
  ) {
    await this.getDomesticTransactionById(userId, id);

    const updateData: any = { ...dto };
    if (dto.sourceAccountId) {
      updateData.sourceAccountId = new Types.ObjectId(dto.sourceAccountId);
    }
    if (dto.transferTime) {
      updateData.transferTime = new Date(dto.transferTime);
    }

    const updated = await this.domesticTxnModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .exec();

    return updated;
  }

  async deleteDomesticTransaction(userId: string, id: string) {
    await this.getDomesticTransactionById(userId, id);
    await this.domesticTxnModel.findByIdAndDelete(id).exec();
    return { message: 'Xóa giao dịch nội địa thành công' };
  }

  // =========================================================================
  // CRUD BỔ SUNG CHO NGÂN HÀNG LIÊN KẾT (Linked Bank Transactions)
  // =========================================================================
  async createLinkedBankTransaction(
    userId: string,
    dto: CreateLinkedBankTransactionDto,
  ) {
    let linkedBankAccountId = dto.linkedBankAccountId
      ? new Types.ObjectId(dto.linkedBankAccountId)
      : undefined;

    let targetAccount: AccountDocument | null = null;
    if (dto.linkedBankAccountId) {
      try {
        targetAccount = await this.accountsService.getAccountById(
          userId,
          dto.linkedBankAccountId,
        );
      } catch (_) { }
    }

    if (!targetAccount) {
      const allAccounts = await this.accountsService.getMyAccounts(userId);
      targetAccount =
        allAccounts.find(
          (b) =>
            (b.category === AccountCategory.LINKED_BANK || (!b.category && b.linkedBankCode)) &&
            (b.accountNumber === dto.accountNumberMasked ||
              b.linkedBankCode?.toUpperCase() === dto.bankCode.toUpperCase()),
        ) ||
        allAccounts.find(
          (b) =>
            b.category === AccountCategory.LINKED_BANK ||
            (!b.category && b.linkedBankCode && b.linkedBankCode !== 'GMONEY'),
        ) ||
        null;
    }

    if (targetAccount) {
      linkedBankAccountId = new Types.ObjectId(targetAccount.id);
    } else if (!linkedBankAccountId) {
      linkedBankAccountId = new Types.ObjectId();
    }

    // Xác định chiều giao dịch: 'IN' (tiền vào -> cộng tiền +) hoặc 'OUT' (tiền ra -> trừ tiền -)
    const isDirectionIn = (dto.direction as string) === 'IN';
    const delta = isDirectionIn ? dto.amount : -dto.amount;

    const currentBalance = targetAccount?.availableBalance ?? 0;
    const newBalance = Math.max(0, currentBalance + delta);

    // Tự động cập nhật số dư của tài khoản ngân hàng liên kết tương ứng
    if (targetAccount) {
      await this.accountsService.updateAccount(userId, targetAccount.id, {
        availableBalance: newBalance,
        availableBalanceEdit: newBalance,
        totalBalance: newBalance,
      });
    }

    const created = await this.linkedBankTxnModel.create({
      userId: new Types.ObjectId(userId),
      linkedBankAccountId,
      bankCode: dto.bankCode.toUpperCase(),
      bankName: dto.bankName || `${dto.bankCode} Bank`,
      accountNumberMasked: dto.accountNumberMasked,
      direction: dto.direction,
      amount: dto.amount,
      balanceAfter: targetAccount ? newBalance : (dto.balanceAfter ?? 300000),
      currency: dto.currency || 'KRW',
      description: dto.description,
      status: dto.status || LinkedBankTransactionStatus.SUCCESS,
      transactionTime: dto.transactionTime
        ? new Date(dto.transactionTime)
        : new Date(),
    });

    return created;
  }

  async getLinkedBankTransactionById(userId: string, id: string) {
    const txn = await this.linkedBankTxnModel.findById(id).exec();
    if (!txn) {
      throw new NotFoundException('Giao dịch ngân hàng không tồn tại');
    }
    if (txn.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập giao dịch này');
    }
    return txn;
  }

  async updateLinkedBankTransaction(
    userId: string,
    id: string,
    dto: UpdateLinkedBankTransactionDto,
  ) {
    const oldTxn = await this.getLinkedBankTransactionById(userId, id);

    const updateData: any = { ...dto };
    if (dto.linkedBankAccountId) {
      updateData.linkedBankAccountId = new Types.ObjectId(dto.linkedBankAccountId);
    }
    if (dto.transactionTime) {
      updateData.transactionTime = new Date(dto.transactionTime);
    }

    const targetAccountId = dto.linkedBankAccountId || oldTxn.linkedBankAccountId?.toString();
    let targetAccount: AccountDocument | null = null;
    if (targetAccountId) {
      try {
        targetAccount = await this.accountsService.getAccountById(userId, targetAccountId);
      } catch (_) { }
    }

    // Điều chỉnh số dư ngân hàng liên kết nếu thay đổi số tiền hoặc chiều giao dịch
    if (targetAccount && (dto.amount !== undefined || dto.direction !== undefined)) {
      const oldDirectionIn = (oldTxn.direction as string) === 'IN';
      const oldDelta = oldDirectionIn ? oldTxn.amount : -oldTxn.amount;

      const newDirection = dto.direction ?? oldTxn.direction;
      const newDirectionIn = (newDirection as string) === 'IN';
      const newAmount = dto.amount ?? oldTxn.amount;
      const newDelta = newDirectionIn ? newAmount : -newAmount;

      const diff = newDelta - oldDelta;
      const newBalance = Math.max(0, (targetAccount.availableBalance || 0) + diff);
      await this.accountsService.updateAccount(userId, targetAccount.id, {
        availableBalance: newBalance,
        availableBalanceEdit: newBalance,
        totalBalance: newBalance,
      });
      updateData.balanceAfter = newBalance;
    }

    const updated = await this.linkedBankTxnModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .exec();

    return updated;
  }

  async deleteLinkedBankTransaction(userId: string, id: string) {
    await this.getLinkedBankTransactionById(userId, id);
    await this.linkedBankTxnModel.findByIdAndDelete(id).exec();
    return { message: 'Xóa giao dịch ngân hàng thành công' };
  }
}
