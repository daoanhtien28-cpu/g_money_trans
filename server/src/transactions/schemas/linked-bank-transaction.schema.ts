import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LinkedBankTransactionDocument = LinkedBankTransaction & Document;

export enum BankTransactionDirection {
  IN = 'IN',   // Cộng tiền (+)
  OUT = 'OUT', // Trừ tiền (-)
}

export enum LinkedBankTransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'linked_bank_transactions' })
export class LinkedBankTransaction {
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, index: true })
  linkedBankAccountId: Types.ObjectId;

  @Prop({ required: true, index: true })
  bankCode: string; // SHINHAN, NH, KB, HANA,...

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumberMasked: string;

  // Dòng tiền
  @Prop({
    required: true,
    enum: BankTransactionDirection,
    default: BankTransactionDirection.OUT,
    index: true,
  })
  direction: string; // IN: (+), OUT: (-)

  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ required: true, default: 0 })
  balanceAfter: number; // Số dư tài khoản ngân hàng sau giao dịch

  @Prop({ default: 'KRW' })
  currency: string;

  @Prop({ required: true })
  description: string; // Nội dung giao dịch / memo

  @Prop({
    default: LinkedBankTransactionStatus.SUCCESS,
    enum: LinkedBankTransactionStatus,
    index: true,
  })
  status: string;

  @Prop({ default: Date.now, index: true })
  transactionTime: Date;
}

export const LinkedBankTransactionSchema = SchemaFactory.createForClass(
  LinkedBankTransaction,
);

LinkedBankTransactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

LinkedBankTransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});
