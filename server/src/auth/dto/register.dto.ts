import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email người dùng (dùng để đăng ký và đăng nhập)',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu (gồm đúng 6 chữ số)',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Matches(/^\d{6}$/, { message: 'Mật khẩu phải gồm đúng 6 chữ số' })
  password: string;

  @ApiProperty({
    example: 'DAO ANH TIEN',
    description: 'Họ và tên người dùng',
  })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  fullName: string;

  @ApiPropertyOptional({
    example: '9704123456789012',
    description: 'Số thẻ ngân hàng (tùy chọn, nếu không truyền hệ thống sẽ tự sinh)',
  })
  @IsOptional()
  @IsString({ message: 'Số thẻ phải là chuỗi ký tự' })
  cardNumber?: string;
}


