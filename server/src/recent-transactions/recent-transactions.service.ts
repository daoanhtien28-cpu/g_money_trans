import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BanksService } from '../banks/banks.service';
import { CreateRecentTransactionDto } from './dto/create-recent-transaction.dto';
import { UpdateRecentTransactionDto } from './dto/update-recent-transaction.dto';
import { RecentTransactionsRepository } from './recent-transactions.repository';
import { RecentTransactionDocument } from './schemas/recent-transaction.schema';

@Injectable()
export class RecentTransactionsService {
  constructor(
    private readonly recentTxRepo: RecentTransactionsRepository,
    private readonly banksService: BanksService,
  ) { }

  /**
   * Lấy danh sách các giao dịch gần đây của người dùng.
   */
  async getAll(userId: string): Promise<RecentTransactionDocument[]> {
    return this.recentTxRepo.findAllByUserId(userId);
  }

  /**
   * Xem chi tiết một giao dịch gần đây theo ID.
   */
  async getById(userId: string, id: string): Promise<RecentTransactionDocument> {
    const item = await this.recentTxRepo.findById(id);
    if (!item) {
      throw new NotFoundException('Giao dịch gần đây không tồn tại');
    }
    if (item.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập giao dịch gần đây này');
    }
    return item;
  }

  /**
   * Thêm mới một giao dịch gần đây.
   * Nếu tài khoản đã tồn tại với cùng số tài khoản & mã ngân hàng thì cập nhật để đưa lên đầu danh sách.
   */
  async create(
    userId: string,
    dto: CreateRecentTransactionDto,
  ): Promise<RecentTransactionDocument> {
    const bankDetails = await this.resolveBankDetails(dto.bankCode, dto.name, dto.imageUrl);

    // Kiểm tra xem số tài khoản này đã có trong danh sách của user chưa
    const existing = await this.recentTxRepo.findByAccount(
      userId,
      dto.accountNumber.trim(),
      bankDetails.bankCode,
    );

    if (existing) {
      const updated = await this.recentTxRepo.update(existing.id, {
        name: bankDetails.name,
        imageUrl: bankDetails.imageUrl,
        accountName: dto.accountName.trim(),
        bankCode: bankDetails.bankCode,
      });
      return updated || existing;
    }

    return this.recentTxRepo.create({
      userId: new Types.ObjectId(userId),
      bankCode: bankDetails.bankCode,
      name: bankDetails.name,
      imageUrl: bankDetails.imageUrl,
      accountNumber: dto.accountNumber.trim(),
      accountName: dto.accountName.trim(),
    });
  }

  /**
   * Nhập / thêm hàng loạt danh sách giao dịch gần đây.
   */
  async bulkCreate(
    userId: string,
    items: CreateRecentTransactionDto[],
  ): Promise<RecentTransactionDocument[]> {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Danh sách giao dịch gần đây không hợp lệ hoặc rỗng');
    }

    const createdItems: RecentTransactionDocument[] = [];
    for (const item of items) {
      const created = await this.create(userId, item);
      createdItems.push(created);
    }
    return createdItems;
  }

  /**
   * Cập nhật / sửa thông tin giao dịch gần đây.
   */
  async update(
    userId: string,
    id: string,
    dto: UpdateRecentTransactionDto,
  ): Promise<RecentTransactionDocument> {
    const existing = await this.getById(userId, id);

    let bankDetails: { bankCode?: string; name: string; imageUrl: string } = {
      bankCode: dto.bankCode ?? existing.bankCode,
      name: dto.name ?? existing.name,
      imageUrl: dto.imageUrl ?? existing.imageUrl,
    };

    if (dto.bankCode && (!dto.name || !dto.imageUrl)) {
      bankDetails = await this.resolveBankDetails(
        dto.bankCode,
        dto.name ?? existing.name,
        dto.imageUrl ?? existing.imageUrl,
      );
    }

    const updateData: Partial<RecentTransactionDocument> = {};
    if (dto.bankCode !== undefined) updateData.bankCode = bankDetails.bankCode;
    if (dto.name !== undefined) updateData.name = bankDetails.name;
    if (dto.imageUrl !== undefined) updateData.imageUrl = bankDetails.imageUrl;
    if (dto.accountNumber !== undefined) updateData.accountNumber = dto.accountNumber.trim();
    if (dto.accountName !== undefined) updateData.accountName = dto.accountName.trim();

    const updated = await this.recentTxRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('Không thể cập nhật giao dịch gần đây');
    }
    return updated;
  }

  /**
   * Xóa một giao dịch gần đây theo ID.
   */
  async delete(userId: string, id: string): Promise<{ success: boolean; message: string }> {
    await this.getById(userId, id);
    await this.recentTxRepo.delete(id);
    return {
      success: true,
      message: 'Đã xóa giao dịch gần đây thành công',
    };
  }

  /**
   * Xóa toàn bộ danh sách giao dịch gần đây của người dùng.
   */
  async deleteAll(userId: string): Promise<{ success: boolean; deletedCount: number }> {
    const deletedCount = await this.recentTxRepo.deleteAllByUserId(userId);
    return {
      success: true,
      deletedCount,
    };
  }

  /**
   * Helper tìm thông tin ngân hàng tự động nếu thiếu name hoặc imageUrl.
   */
  private async resolveBankDetails(
    bankCode?: string,
    name?: string,
    imageUrl?: string,
  ): Promise<{ bankCode?: string; name: string; imageUrl: string }> {
    let resolvedName = name || '';
    let resolvedImage = imageUrl || '';
    let resolvedCode = bankCode;

    if (bankCode) {
      try {
        const bank = await this.banksService.getBankByCode(bankCode);
        if (!resolvedName) resolvedName = bank.name;
        if (!resolvedImage) resolvedImage = bank.imageUrl;
        resolvedCode = bank.code;
      } catch (_) { }
    }

    if (!resolvedName) resolvedName = '국민은행';
    if (!resolvedImage) resolvedImage = 'assets/images/bank/bank_kb.png';

    return {
      bankCode: resolvedCode,
      name: resolvedName,
      imageUrl: resolvedImage,
    };
  }
}
