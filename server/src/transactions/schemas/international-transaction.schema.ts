import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InternationalTransactionDocument = InternationalTransaction & Document;

export enum InternationalTransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'international_transactions' })
export class InternationalTransaction {
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: 'GMONEY_PAY', required: true })
  sourceAccountType: string; // Cố định GmoneyPay

  @Prop({ required: true })
  sourceAccountNumber: string;

  // Người gửi
  @Prop({ required: true })
  senderName: string;

  @Prop({ default: '' })
  senderPhone: string;

  // Người nhận
  @Prop({ required: true })
  recipientName: string;

  @Prop({ required: true })
  recipientAccountNumber: string;

  @Prop({ required: true })
  recipientBankCode: string;

  @Prop({ required: true })
  recipientBankName: string;

  @Prop({ required: true, default: 'VN' })
  recipientCountry: string; // VN, PH, ID, US,...

  // Tiền tệ & Chi phí
  @Prop({ required: true, default: 0 })
  sendAmount: number; // Tiền gửi (KRW)

  @Prop({ default: 'KRW' })
  sendCurrency: string;

  @Prop({ required: true, default: 0 })
  receiveAmount: number; // Tiền nhận (VND, USD,...)

  @Prop({ required: true, default: 'VND' })
  receiveCurrency: string;

  @Prop({ required: true, default: 1 })
  exchangeRate: number; // Tỷ giá

  @Prop({ default: 0 })
  transferFee: number; // Phí chuyển tiền

  @Prop({ default: 0 })
  conversionFee: number; // Phí chuyển đổi ngoại tệ

  @Prop({ required: true, default: 0 })
  totalDebited: number; // Tổng tiền trừ = sendAmount + transferFee + conversionFee

  @Prop({
    default: InternationalTransactionStatus.SUCCESS,
    enum: InternationalTransactionStatus,
    index: true,
  })
  status: string;

  @Prop({ default: '' })
  failureReason?: string;

  @Prop({ default: Date.now, index: true })
  transferTime: Date;
}

export const InternationalTransactionSchema = SchemaFactory.createForClass(
  InternationalTransaction,
);

InternationalTransactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

InternationalTransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});
