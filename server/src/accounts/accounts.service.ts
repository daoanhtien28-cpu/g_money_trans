import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BanksService } from '../banks/banks.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {
  AccountCategory,
  AccountDocument,
  AccountStatus,
  AccountType,
} from './schemas/account.schema';
import { AccountsRepository } from './accounts.repository';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountsRepo: AccountsRepository,
    private readonly banksService: BanksService,
  ) { }

  /**
   * Lấy tổng quan tài khoản (Account Information Overview) cho màn hình thông tin tài khoản.
   * Cấu trúc JSON chuẩn: summary, gmoneyPay (1), gmoneyWallet (1), linkedBankAccounts (list).
   */
  async getAccountOverview(userId: string, defaultOwnerName?: string) {
    let allAccounts = await this.accountsRepo.findByUserId(userId);
    if (allAccounts.length === 0) {
      await this.createDefaultAccounts(userId, defaultOwnerName || 'DAO ANH TIEN');
      allAccounts = await this.accountsRepo.findByUserId(userId);
    }

    let gmoneyPay = allAccounts.find((w) => w.category === AccountCategory.GMONEY_PAY);
    let gmoneyWallet = allAccounts.find((w) => w.category === AccountCategory.GMONEY_WALLET);
    let linkedBanks = allAccounts.filter(
      (w) => w.category === AccountCategory.LINKED_BANK || (!w.category && w.linkedBankCode),
    );

    if (!gmoneyPay) {
      gmoneyPay = await this.createGmoneyPay(userId, defaultOwnerName || 'DAO ANH TIEN');
    }
    if (!gmoneyWallet) {
      gmoneyWallet = await this.createGmoneyWallet(userId, defaultOwnerName || 'DAO ANH TIEN');
    }

    if (linkedBanks.length > 0 && !linkedBanks.some((b) => b.isMain || b.using)) {
      await this.accountsRepo.update(linkedBanks[0].id, { isMain: true, using: true });
      linkedBanks[0].isMain = true;
      linkedBanks[0].using = true;
    }

    const payBalance = gmoneyPay.availableBalance ?? 0;
    const walletBalance = gmoneyWallet.availableBalance ?? 0;

    return {
      gmoneyPay: {
        id: gmoneyPay.id,
        accountNumber: gmoneyPay.accountNumber,
        balance: payBalance,
        currency: gmoneyPay.currency || 'KRW',
        status: gmoneyPay.status || 'ACTIVE',
        availableActions: gmoneyPay.availableActions?.length
          ? gmoneyPay.availableActions
          : ['TOP_UP', 'DOMESTIC_TRANSFER', 'OVERSEAS_TRANSFER', 'ATM_WITHDRAW'],
      },
      gmoneyWallet: {
        id: gmoneyWallet.id,
        accountNumber: gmoneyWallet.accountNumber,
        balance: walletBalance,
        currency: gmoneyWallet.currency || 'KRW',
        status: gmoneyWallet.status || 'ACTIVE',
        availableActions: gmoneyWallet.availableActions?.length
          ? gmoneyWallet.availableActions
          : ['TOP_UP', 'DOMESTIC_TRANSFER', 'TRANSACTION_HISTORY', 'ATM_WITHDRAW'],
      },
      linkedBankAccounts: linkedBanks.map((bank) => {
        const isPrimary = bank.isMain ?? bank.using ?? false;
        return {
          id: bank.id,
          bankCode: bank.linkedBankCode,
          bankName: bank.linkedBankName,
          accountNumberMasked: bank.accountNumber,
          balance: bank.availableBalance ?? 0,
          currency: bank.currency || 'KRW',
          isPrimary,
          status: bank.status || 'ACTIVE',
          imageUrl: bank.imageUrl,
          lastSyncedAt: new Date(bank.lastSyncedAt || (bank as any).updatedAt || Date.now()).toISOString(),
          availableActions: bank.availableActions?.length
            ? bank.availableActions
            : isPrimary
              ? ['TOP_UP_TO_PAY', 'UNLINK']
              : ['SET_PRIMARY', 'TOP_UP_TO_PAY', 'UNLINK'],
        };
      }),
    };
  }

  /**
   * Lấy danh sách tài khoản theo bộ lọc (category).
   */
  async getMyAccounts(userId: string, defaultOwnerName?: string, category?: string): Promise<AccountDocument[]> {
    let accounts = await this.accountsRepo.findByUserId(userId, category);
    if (accounts.length === 0) {
      await this.createDefaultAccounts(userId, defaultOwnerName || 'DAO ANH TIEN');
      accounts = await this.accountsRepo.findByUserId(userId, category);
    }
    return accounts;
  }

  /**
   * Lấy tài khoản ngân hàng chính (Main) đang sử dụng.
   */
  async getActiveAccount(userId: string, defaultOwnerName?: string): Promise<AccountDocument> {
    let account = await this.accountsRepo.findActiveByUserId(userId);
    if (!account) {
      const allAccounts = await this.accountsRepo.findByUserId(userId);
      if (allAccounts.length === 0) {
        await this.createDefaultAccounts(userId, defaultOwnerName || 'DAO ANH TIEN');
        account = await this.accountsRepo.findActiveByUserId(userId);
      } else {
        account = allAccounts[0];
        await this.accountsRepo.update(account.id, { isMain: true, using: true });
        account.isMain = true;
        account.using = true;
      }
    }
    return account!;
  }

  /**
   * Lấy chi tiết tài khoản theo ID.
   */
  async getAccountById(userId: string, accountId: string): Promise<AccountDocument> {
    const account = await this.accountsRepo.findById(accountId);
    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    if (account.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài khoản này');
    }
    return account;
  }

  /**
   * Liên kết tài khoản ngân hàng mới hoặc tạo tài khoản.
   */
  async createAccount(userId: string, dto: CreateAccountDto): Promise<AccountDocument> {
    const accountNumber = dto.accountNumber || this.generateAccountNumber();

    const existing = await this.accountsRepo.findByAccountNumber(accountNumber);
    if (existing) {
      throw new ConflictException('Số tài khoản này đã tồn tại');
    }

    const category = dto.category || AccountCategory.LINKED_BANK;
    const requestedMain = dto.isMain === true || dto.using === true || dto.main === true;

    if (category === AccountCategory.LINKED_BANK && requestedMain) {
      await this.accountsRepo.setAllLinkedBanksUsingFalse(userId);
    }

    let linkedBankCode = dto.linkedBankCode || 'SHINHAN';
    let linkedBankName = dto.linkedBankName || 'Shinhan Bank';
    let imageUrl = dto.imageUrl || 'assets/images/bank/bank_shinhan.png';

    if (dto.linkedBankCode) {
      try {
        const bank = await this.banksService.getBankByCode(dto.linkedBankCode);
        linkedBankCode = bank.code;
        linkedBankName = bank.name;
        imageUrl = bank.imageUrl;
      } catch (_) { }
    }

    const availableBalance = dto.availableBalance ?? 0;
    const availableBalanceEdit = dto.availableBalanceEdit ?? availableBalance;
    const frozenBalance = dto.frozenBalance ?? 0;
    const totalBalance = dto.totalBalance ?? availableBalance + frozenBalance;

    return this.accountsRepo.save({
      userId: new Types.ObjectId(userId),
      accountNumber,
      ownerName: dto.ownerName,
      accountTitle: dto.accountTitle || linkedBankName,
      category,
      currency: dto.currency || 'KRW',
      availableBalance,
      availableBalanceEdit,
      totalBalance,
      frozenBalance,
      accountType: dto.accountType || AccountType.PERSONAL,
      status: dto.status || AccountStatus.ACTIVE,
      linkedBankCode,
      linkedBankName,
      linkedBankAccount: dto.linkedBankAccount || accountNumber,
      imageUrl,
      isMain: requestedMain,
      using: requestedMain,
      availableActions: dto.availableActions || ['TOP_UP_TO_PAY', 'UNLINK'],
      lastSyncedAt: new Date(),
    });
  }

  /**
   * Cập nhật thông tin tài khoản theo ID.
   */
  async updateAccount(
    userId: string,
    accountId: string,
    dto: UpdateAccountDto,
  ): Promise<AccountDocument> {
    await this.getAccountById(userId, accountId);

    const isSettingMain = dto.isMain === true || dto.using === true || dto.main === true;
    if (isSettingMain) {
      await this.accountsRepo.setAllLinkedBanksUsingFalse(userId, accountId);
      dto.isMain = true;
      dto.using = true;
    }

    if (dto.linkedBankCode) {
      try {
        const bank = await this.banksService.getBankByCode(dto.linkedBankCode);
        dto.linkedBankCode = bank.code;
        dto.linkedBankName = bank.name;
        dto.imageUrl = bank.imageUrl;
      } catch (_) { }
    }

    const updated = await this.accountsRepo.update(accountId, dto);
    if (!updated) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    return updated;
  }

  /**
   * Đặt tài khoản ngân hàng làm tài khoản chính (Main).
   */
  async setMainAccount(userId: string, accountId: string): Promise<AccountDocument> {
    await this.getAccountById(userId, accountId);
    await this.accountsRepo.setAllLinkedBanksUsingFalse(userId, accountId);
    const updated = await this.accountsRepo.update(accountId, { isMain: true, using: true });
    if (!updated) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    return updated;
  }

  /**
   * Đồng bộ số dư ngân hàng (Pull-to-refresh).
   */
  async syncBankBalance(userId: string, accountId: string): Promise<AccountDocument> {
    const account = await this.getAccountById(userId, accountId);
    const updated = await this.accountsRepo.update(account.id, {
      lastSyncedAt: new Date(),
    });
    return updated || account;
  }

  /**
   * Hủy liên kết tài khoản ngân hàng theo ID.
   */
  async deleteAccount(userId: string, accountId: string): Promise<{ message: string }> {
    const account = await this.getAccountById(userId, accountId);
    await this.accountsRepo.delete(accountId);

    if (account.isMain || account.using) {
      const remaining = await this.accountsRepo.findByUserId(userId, AccountCategory.LINKED_BANK);
      if (remaining.length > 0) {
        await this.accountsRepo.update(remaining[0].id, { isMain: true, using: true });
      }
    }

    return { message: 'Hủy liên kết tài khoản thành công' };
  }

  /**
   * Tạo trọn bộ tài khoản mẫu mặc định cho người dùng.
   * Chỉ khởi tạo GmoneyPay và GmoneyWallet với số dư = 0, danh sách liên kết ngân hàng rỗng.
   */
  async createDefaultAccounts(userId: string, ownerName: string): Promise<void> {
    await this.createGmoneyPay(userId, ownerName);
    await this.createGmoneyWallet(userId, ownerName);
  }

  /**
   * Tạo tài khoản GmoneyPay (số dư mặc định = 0)
   */
  async createGmoneyPay(userId: string, ownerName: string): Promise<AccountDocument> {
    const existing = await this.accountsRepo.findByUserAndCategory(userId, AccountCategory.GMONEY_PAY);
    if (existing) return existing;

    return this.accountsRepo.save({
      userId: new Types.ObjectId(userId),
      accountNumber: `GMP-KRW-${Math.floor(100000 + Math.random() * 900000)}`,
      ownerName: ownerName.toUpperCase(),
      accountTitle: 'GmoneyPay',
      category: AccountCategory.GMONEY_PAY,
      currency: 'KRW',
      availableBalance: 0,
      availableBalanceEdit: 0,
      totalBalance: 0,
      frozenBalance: 0,
      accountType: AccountType.PERSONAL,
      status: AccountStatus.ACTIVE,
      linkedBankCode: 'GMONEY',
      linkedBankName: 'GmoneyPay',
      imageUrl: 'assets/images/bank/logo_wallet.png',
      isMain: false,
      using: false,
      availableActions: ['TOP_UP', 'DOMESTIC_TRANSFER', 'OVERSEAS_TRANSFER', 'ATM_WITHDRAW'],
      lastSyncedAt: new Date(),
    });
  }

  /**
   * Tạo ví GmoneyWallet (số dư mặc định = 0)
   */
  async createGmoneyWallet(userId: string, ownerName: string): Promise<AccountDocument> {
    const existing = await this.accountsRepo.findByUserAndCategory(userId, AccountCategory.GMONEY_WALLET);
    if (existing) return existing;

    return this.accountsRepo.save({
      userId: new Types.ObjectId(userId),
      accountNumber: `GMW-KRW-${Math.floor(100000 + Math.random() * 900000)}`,
      ownerName: ownerName.toUpperCase(),
      accountTitle: 'GmoneyWallet',
      category: AccountCategory.GMONEY_WALLET,
      currency: 'KRW',
      availableBalance: 0,
      availableBalanceEdit: 0,
      totalBalance: 0,
      frozenBalance: 0,
      accountType: AccountType.PERSONAL,
      status: AccountStatus.ACTIVE,
      linkedBankCode: 'GMONEY',
      linkedBankName: 'GmoneyWallet',
      imageUrl: 'assets/images/bank/logo_wallet.png',
      isMain: false,
      using: false,
      availableActions: ['TOP_UP', 'DOMESTIC_TRANSFER', 'TRANSACTION_HISTORY', 'ATM_WITHDRAW'],
      lastSyncedAt: new Date(),
    });
  }

  /**
   * Reset tài khoản người dùng về trạng thái mặc định (xóa toàn bộ liên kết ngân hàng, số dư về 0)
   */
  async resetAccountsToZero(userId: string, defaultOwnerName: string) {
    const allAccounts = await this.accountsRepo.findByUserId(userId);
    for (const acc of allAccounts) {
      if (
        acc.category === AccountCategory.LINKED_BANK ||
        (!acc.category && acc.linkedBankCode && acc.linkedBankCode !== 'GMONEY')
      ) {
        await this.accountsRepo.delete(acc.id);
      }
    }

    let pay = allAccounts.find((a) => a.category === AccountCategory.GMONEY_PAY);
    if (pay) {
      await this.accountsRepo.update(pay.id, {
        availableBalance: 0,
        availableBalanceEdit: 0,
        totalBalance: 0,
        frozenBalance: 0,
      });
    } else {
      await this.createGmoneyPay(userId, defaultOwnerName);
    }

    let wallet = allAccounts.find((a) => a.category === AccountCategory.GMONEY_WALLET);
    if (wallet) {
      await this.accountsRepo.update(wallet.id, {
        availableBalance: 0,
        availableBalanceEdit: 0,
        totalBalance: 0,
        frozenBalance: 0,
      });
    } else {
      await this.createGmoneyWallet(userId, defaultOwnerName);
    }

    return this.getAccountOverview(userId, defaultOwnerName);
  }


  // --- Các hàm hỗ trợ tương thích ngược với code cũ ---
  async getMyWallet(userId: string, defaultOwnerName?: string): Promise<AccountDocument> {
    return this.getActiveAccount(userId, defaultOwnerName);
  }

  async getActiveWallet(userId: string, defaultOwnerName?: string): Promise<AccountDocument> {
    return this.getActiveAccount(userId, defaultOwnerName);
  }

  async getWalletById(userId: string, id: string): Promise<AccountDocument> {
    return this.getAccountById(userId, id);
  }

  async updateWallet(userId: string, id: string, dto: UpdateAccountDto): Promise<AccountDocument> {
    return this.updateAccount(userId, id, dto);
  }

  async setMainWallet(userId: string, id: string): Promise<AccountDocument> {
    return this.setMainAccount(userId, id);
  }

  async setUsingWallet(userId: string, id: string): Promise<AccountDocument> {
    return this.setMainAccount(userId, id);
  }

  async deleteWallet(userId: string, id: string): Promise<{ message: string }> {
    return this.deleteAccount(userId, id);
  }

  async createWallet(userId: string, dto: CreateAccountDto): Promise<AccountDocument> {
    return this.createAccount(userId, dto);
  }

  async updateMyWallet(userId: string, dto: UpdateAccountDto): Promise<AccountDocument> {
    const acc = await this.getActiveAccount(userId);
    return this.updateAccount(userId, acc.id, dto);
  }

  async getMyWallets(userId: string, defaultOwnerName?: string, category?: string) {
    if (category) {
      return this.getMyAccounts(userId, defaultOwnerName, category);
    }
    return this.getAccountOverview(userId, defaultOwnerName);
  }

  async createDefaultWallet(userId: string, ownerName: string): Promise<AccountDocument> {
    await this.createDefaultAccounts(userId, ownerName);
    return this.getActiveAccount(userId, ownerName);
  }

  private generateAccountNumber(): string {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    return `${part1} ${part2} ${part3}`;
  }
}
