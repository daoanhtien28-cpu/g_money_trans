import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankDocument = Bank & Document;

@Schema({
  collection: 'banks',
  timestamps: true,
})
export class Bank {
  id: string; // Virtual property mapped from _id

  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ default: '', trim: true })
  shortName: string;

  @Prop({ default: '', trim: true })
  binCode: string;

  @Prop({ required: true, default: '' })
  imageUrl: string;

  @Prop({ default: '#008485' })
  color: string;

  @Prop({ default: 0, index: true })
  order: number;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const BankSchema = SchemaFactory.createForClass(Bank);

BankSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

BankSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

BankSchema.index({ order: 1, name: 1 });
