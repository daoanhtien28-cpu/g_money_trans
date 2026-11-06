import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email tài khoản cần reset mật khẩu' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: '111111', description: 'Mã PIN reset mật khẩu (6 chữ số)' })
  @IsString({ message: 'Mã PIN phải là chuỗi ký tự' })
  @Matches(/^\d{6}$/, { message: 'Mã PIN phải gồm đúng 6 chữ số' })
  pin: string;

  @ApiProperty({ example: '654321', description: 'Mật khẩu mới (gồm đúng 6 chữ số)' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @Matches(/^\d{6}$/, { message: 'Mật khẩu mới phải gồm đúng 6 chữ số' })
  newPassword: string;
}
