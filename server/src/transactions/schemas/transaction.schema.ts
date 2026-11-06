import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  id: string; // Virtual property mapped from _id

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', index: true })
  accountId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', index: true })
  walletId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  transferNumber: string; // Mã giao dịch (VD: 1128OTT260802051)

  @Prop({ default: 'Sh 수협' })
  transferChannel: string; // Kênh (Sh 수협)

  @Prop({ default: '체크' })
  transferTypeTag: string; // Tag hiển thị góc trên (VD: '체크' [Thẻ check], '이체' [Chuyển khoản], 'ATM')

  @Prop({ required: true, trim: true, index: true })
  title: string; // Tên hiển thị to trên thẻ (VD: 자연애마트, 김환, GS25...)

  @Prop({ default: '', trim: true })
  content: string; // Ghi chú / Lời nhắn (메모)

  @Prop({ default: false, index: true })
  isDeposit: boolean; // false: 출금 (Tiền ra -), true: 입금 (Tiền vào +)

  @Prop({ default: 'KRW' })
  currency: string; // Tiền tệ (KRW)

  @Prop({ required: true, default: 0 })
  transferAmount: number; // Số tiền giao dịch (VD: 9470, 1540000)

  @Prop({ default: 0 })
  fee: number; // Phí giao dịch (VD: 0)

  @Prop({ default: 0 })
  balanceAfter: number; // Số dư còn lại sau giao dịch (잔액 VD: 2686)

  @Prop({ default: 0 })
  totalWithdrawalAmount: number; // Alias tương thích với UI cũ

  @Prop({ default: TransactionStatus.SUCCESS, enum: TransactionStatus, index: true })
  status: string;

  // Ngân hàng nguồn (Payment Bank)
  @Prop({ type: Object, default: {} })
  paymentBank: {
    bankCode?: string;
    name: string;
    imageUrl: string;
    accountNumber: string;
    accountName: string;
  };

  // Ngân hàng đích / Người nhận (Beneficiary Bank)
  @Prop({ type: Object, default: {} })
  beneficiaryBank: {
    bankCode?: string;
    name: string;
    imageUrl: string;
    accountNumber: string;
    accountName: string;
  };

  @Prop({ required: true, index: true })
  transferTime: string; // Ngày giao dịch (VD: '2026.09.16')

  @Prop({ default: '' })
  transferTimeDetail: string; // Giờ phút giây (VD: '18:08:45' hoặc '2026.09.16 18:08:45')
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, isDeposit: 1 });
TransactionSchema.index({ userId: 1, transferTime: -1 });
