import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bank, BankDocument } from './schemas/bank.schema';

@Injectable()
export class BanksRepository {
  constructor(
    @InjectModel(Bank.name) private readonly bankModel: Model<BankDocument>,
  ) {}

  async findAll(filter: Record<string, any> = {}): Promise<BankDocument[]> {
    return this.bankModel.find(filter).sort({ order: 1, name: 1 }).exec();
  }

  async findById(id: string): Promise<BankDocument | null> {
    return this.bankModel.findById(id).exec();
  }

  async findByCode(code: string): Promise<BankDocument | null> {
    return this.bankModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return this.bankModel.countDocuments(filter).exec();
  }

  async insertMany(banks: Partial<Bank>[]): Promise<BankDocument[]> {
    return this.bankModel.insertMany(banks) as unknown as BankDocument[];
  }

  async save(bankData: Partial<Bank>): Promise<BankDocument> {
    const bank = new this.bankModel(bankData);
    return bank.save();
  }

  async upsertByCode(code: string, updateData: Partial<Bank>): Promise<BankDocument | null> {
    return this.bankModel
      .findOneAndUpdate(
        { code: code.toUpperCase() },
        { $set: updateData },
        { upsert: true, new: true },
      )
      .exec();
  }

  async update(id: string, updateData: Partial<Bank>): Promise<BankDocument | null> {
    return this.bankModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }
}
