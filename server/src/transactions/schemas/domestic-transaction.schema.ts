import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DomesticTransactionDocument = DomesticTransaction & Document;

export enum DomesticSourceType {
  GMONEY_PAY = 'GMONEY_PAY',
  GMONEY_WALLET = 'GMONEY_WALLET',
}

export enum DomesticTransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'domestic_transactions' })
export class DomesticTransaction {
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // Nguồn tiền: GMONEY_PAY hoặc GMONEY_WALLET
  @Prop({
    required: true,
    enum: DomesticSourceType,
    default: DomesticSourceType.GMONEY_WALLET,
    index: true,
  })
  sourceType: string;

  @Prop({ type: Types.ObjectId, ref: 'Account', index: true })
  sourceAccountId?: Types.ObjectId;

  @Prop({ required: true })
  sourceAccountNumber: string;

  // Người nhận
  @Prop({ required: true })
  recipientName: string;

  @Prop({ required: true })
  recipientAccountNumber: string;

  @Prop({ required: true, default: 'SHINHAN' })
  recipientBankCode: string;

  @Prop({ required: true, default: 'Shinhan Bank' })
  recipientBankName: string;

  // Số tiền & Chi phí
  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ default: 0 })
  fee: number;

  @Prop({ default: 'KRW' })
  currency: string;

  @Prop({ default: '' })
  message: string;

  @Prop({
    default: DomesticTransactionStatus.SUCCESS,
    enum: DomesticTransactionStatus,
    index: true,
  })
  status: string;

  @Prop({ default: '' })
  failureReason?: string;

  @Prop({ default: Date.now, index: true })
  transferTime: Date;
}

export const DomesticTransactionSchema = SchemaFactory.createForClass(
  DomesticTransaction,
);

DomesticTransactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

DomesticTransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});
