import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByCardNumber(cardNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ cardNumber }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    if (!email) return null;
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }


  async save(user: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async resetPassword(id: string, password: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { $set: { password }, $unset: { refreshToken: 1 } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async update(
    id: string,
    partial: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, partial, { returnDocument: 'after' })
      .exec();
  }
}

