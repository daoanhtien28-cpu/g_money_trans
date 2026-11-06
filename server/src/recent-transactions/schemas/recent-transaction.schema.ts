import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecentTransactionDocument = RecentTransaction & Document;

@Schema({ timestamps: true, collection: 'recent_transactions' })
export class RecentTransaction {
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: '', trim: true })
  bankCode?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, default: '' })
  imageUrl: string;

  @Prop({ required: true, trim: true, index: true })
  accountNumber: string;

  @Prop({ required: true, trim: true })
  accountName: string;
}

export const RecentTransactionSchema = SchemaFactory.createForClass(RecentTransaction);

RecentTransactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

RecentTransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

RecentTransactionSchema.index({ userId: 1, updatedAt: -1 });
