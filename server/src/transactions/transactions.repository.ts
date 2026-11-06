import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async findWithPagination(
    filter: Record<string, any>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<TransactionDocument[]> {
    return this.transactionModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: Record<string, any>): Promise<number> {
    return this.transactionModel.countDocuments(filter).exec();
  }

  async findById(id: string): Promise<TransactionDocument | null> {
    return this.transactionModel.findById(id).exec();
  }

  async save(transactionData: Partial<Transaction>): Promise<TransactionDocument> {
    const tx = new this.transactionModel(transactionData);
    return tx.save();
  }

  async update(
    id: string,
    updateData: Partial<Transaction>,
  ): Promise<TransactionDocument | null> {
    return this.transactionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.transactionModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  async insertMany(items: Partial<Transaction>[]): Promise<TransactionDocument[]> {
    return this.transactionModel.insertMany(items) as unknown as TransactionDocument[];
  }
}
