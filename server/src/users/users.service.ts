import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { normalizePattern } from '../common/utils/pattern.util';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) { }

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingEmail = await this.usersRepo.findByEmail(normalizedEmail);
    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    let cardNumber = dto.cardNumber;
    if (cardNumber) {
      const existingCard = await this.usersRepo.findByCardNumber(cardNumber);
      if (existingCard) {
        throw new ConflictException('Số thẻ đã được sử dụng');
      }
    } else {
      cardNumber = await this.generateUniqueCardNumber();
    }

    const hashedPassword = await bcrypt.hash(normalizePattern(dto.password), 10);

    return this.usersRepo.save({
      cardNumber,
      email: normalizedEmail,
      password: hashedPassword,
      fullName: dto.fullName,
    });
  }

  private async generateUniqueCardNumber(): Promise<string> {
    let cardNumber = '';
    let exists = true;
    while (exists) {
      const random12 = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      cardNumber = `9704${random12}`;
      const found = await this.usersRepo.findByCardNumber(cardNumber);
      if (!found) {
        exists = false;
      }
    }
    return cardNumber;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return user;
  }

  async findByCardNumber(cardNumber: string): Promise<UserDocument | null> {
    return this.usersRepo.findByCardNumber(cardNumber);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepo.findByEmail(email);
  }


  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const updated = await this.usersRepo.update(userId, {
      fullName: dto.fullName,
    });
    if (!updated) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return updated;
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    const isMatch = await bcrypt.compare(
      normalizePattern(dto.currentPassword),
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const isSameAsOld = await bcrypt.compare(
      normalizePattern(dto.newPassword),
      user.password,
    );
    if (isSameAsOld) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu cũ',
      );
    }

    const newHashed = await bcrypt.hash(
      normalizePattern(dto.newPassword),
      10,
    );
    await this.usersRepo.update(userId, { password: newHashed });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const password = await bcrypt.hash(normalizePattern(newPassword), 10);
    const updated = await this.usersRepo.resetPassword(user.id, password);
    if (!updated) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashed = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;
    await this.usersRepo.update(userId, { refreshToken: hashed ?? undefined });
  }
}

