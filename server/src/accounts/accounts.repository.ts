import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountCategory, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountsRepository {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
  ) { }

  async findOneByUserId(userId: string): Promise<AccountDocument | null> {
    return this.accountModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  async findActiveByUserId(userId: string): Promise<AccountDocument | null> {
    return this.accountModel.findOne({
      userId: new Types.ObjectId(userId),
      $or: [{ using: true }, { isMain: true }],
    }).exec();
  }

  async findByUserAndCategory(userId: string, category: string): Promise<AccountDocument | null> {
    return this.accountModel.findOne({
      userId: new Types.ObjectId(userId),
      category,
    }).exec();
  }

  async findByUserId(userId: string, category?: string): Promise<AccountDocument[]> {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (category) {
      filter.category = category;
    }
    return this.accountModel
      .find(filter)
      .sort({ isMain: -1, using: -1, createdAt: -1 })
      .exec();
  }

  async countByUserId(userId: string, category?: string): Promise<number> {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (category) {
      filter.category = category;
    }
    return this.accountModel.countDocuments(filter).exec();
  }

  async setAllAccountsUsingFalse(userId: string, exceptAccountId?: string): Promise<void> {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (exceptAccountId) {
      filter._id = { $ne: new Types.ObjectId(exceptAccountId) };
    }
    await this.accountModel.updateMany(filter, { $set: { using: false, isMain: false } }).exec();
  }

  async setAllLinkedBanksUsingFalse(userId: string, exceptAccountId?: string): Promise<void> {
    const filter: any = {
      userId: new Types.ObjectId(userId),
      category: AccountCategory.LINKED_BANK,
    };
    if (exceptAccountId) {
      filter._id = { $ne: new Types.ObjectId(exceptAccountId) };
    }
    await this.accountModel.updateMany(filter, { $set: { using: false, isMain: false } }).exec();
  }

  async findById(id: string): Promise<AccountDocument | null> {
    return this.accountModel.findById(id).exec();
  }

  async findByAccountNumber(accountNumber: string): Promise<AccountDocument | null> {
    return this.accountModel.findOne({ accountNumber }).exec();
  }

  async save(account: Partial<Account>): Promise<AccountDocument> {
    const created = new this.accountModel(account);
    return created.save();
  }

  async update(
    id: string,
    partial: Partial<Account>,
  ): Promise<AccountDocument | null> {
    return this.accountModel
      .findByIdAndUpdate(id, partial, { returnDocument: 'after' })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.accountModel.findByIdAndDelete(id).exec();
    return !!res;
  }
}
