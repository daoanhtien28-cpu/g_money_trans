import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RecentTransaction,
  RecentTransactionDocument,
} from './schemas/recent-transaction.schema';

@Injectable()
export class RecentTransactionsRepository {
  constructor(
    @InjectModel(RecentTransaction.name)
    private readonly recentTxModel: Model<RecentTransactionDocument>,
  ) {}

  async findAllByUserId(userId: string): Promise<RecentTransactionDocument[]> {
    return this.recentTxModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<RecentTransactionDocument | null> {
    return this.recentTxModel.findById(id).exec();
  }

  async findByAccount(
    userId: string,
    accountNumber: string,
    bankCode?: string,
  ): Promise<RecentTransactionDocument | null> {
    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
      accountNumber,
    };
    if (bankCode) {
      filter.bankCode = bankCode;
    }
    return this.recentTxModel.findOne(filter).exec();
  }

  async count(userId: string): Promise<number> {
    return this.recentTxModel
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async create(
    data: Partial<RecentTransaction>,
  ): Promise<RecentTransactionDocument> {
    const doc = new this.recentTxModel(data);
    return doc.save();
  }

  async insertMany(
    items: Partial<RecentTransaction>[],
  ): Promise<RecentTransactionDocument[]> {
    return this.recentTxModel.insertMany(
      items,
    ) as unknown as RecentTransactionDocument[];
  }

  async update(
    id: string,
    updateData: Partial<RecentTransaction>,
  ): Promise<RecentTransactionDocument | null> {
    return this.recentTxModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.recentTxModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    const res = await this.recentTxModel
      .deleteMany({ userId: new Types.ObjectId(userId) })
      .exec();
    return res.deletedCount || 0;
  }
}
