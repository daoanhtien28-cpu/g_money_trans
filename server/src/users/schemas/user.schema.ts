import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  id: string; // Virtual property

  @Prop({ unique: true, sparse: true })
  cardNumber?: string;

  @Prop({ unique: true, required: true, lowercase: true, trim: true, sparse: true })
  email: string;

  @Prop({ required: true })
  password: string;


  @Prop()
  fullName?: string;

  @Prop()
  refreshToken?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure virtual 'id' exists and is included in toJSON
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
    delete (ret as any).password;
    delete (ret as any).refreshToken;
    return ret;
  },
});
