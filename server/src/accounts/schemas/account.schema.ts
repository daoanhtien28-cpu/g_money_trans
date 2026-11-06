import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

export enum AccountCategory {
  GMONEY_PAY = 'GMONEY_PAY',
  GMONEY_WALLET = 'GMONEY_WALLET',
  LINKED_BANK = 'LINKED_BANK',
}

export enum AccountType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
  SAVINGS = 'SAVINGS',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  INACTIVE = 'INACTIVE',
}

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
  id: string; // Virtual property mapped from _id

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  accountNumber: string;

  @Prop({ required: true })
  ownerName: string;

  @Prop({ default: 'Tài khoản' })
  accountTitle: string; // 'GmoneyPay' | 'GmoneyWallet' | 'Shinhan Bank' | 'NH Bank'

  @Prop({
    default: AccountCategory.LINKED_BANK,
    enum: AccountCategory,
    index: true,
  })
  category: string; // GMONEY_PAY | GMONEY_WALLET | LINKED_BANK

  @Prop({ default: 'KRW' })
  currency: string;

  @Prop({ default: 0 })
  availableBalance: number;

  @Prop({ default: 0 })
  availableBalanceEdit: number;

  @Prop({ default: 0 })
  totalBalance: number;

  @Prop({ default: 0 })
  frozenBalance: number;

  @Prop({ default: AccountType.PERSONAL, enum: AccountType })
  accountType: string;

  @Prop({ default: AccountStatus.ACTIVE, enum: AccountStatus })
  status: string;

  @Prop({ default: 'SHINHAN', uppercase: true, trim: true })
  linkedBankCode: string;

  @Prop({ default: 'Shinhan Bank' })
  linkedBankName: string;

  @Prop({ default: '' })
  linkedBankAccount: string;

  @Prop({ default: 'assets/images/bank/bank_shinhan.png' })
  imageUrl: string;

  @Prop({ default: false, index: true })
  using: boolean;

  @Prop({ default: false, index: true })
  isMain: boolean;

  @Prop({ type: [String], default: [] })
  availableActions: string[];

  @Prop({ type: Date, default: null })
  lastSyncedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

AccountSchema.virtual('main').get(function () {
  return this.isMain || this.using || false;
});

AccountSchema.virtual('is_primary').get(function () {
  return this.isMain || this.using || false;
});

AccountSchema.virtual('isPrimary').get(function () {
  return this.isMain || this.using || false;
});

AccountSchema.virtual('balance').get(function () {
  return this.availableBalanceEdit ?? this.availableBalance ?? 0;
});

AccountSchema.virtual('bankCode').get(function () {
  return this.linkedBankCode;
});

AccountSchema.virtual('bankName').get(function () {
  return this.linkedBankName;
});

AccountSchema.virtual('accountNumberMasked').get(function () {
  return this.accountNumber;
});

AccountSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});
