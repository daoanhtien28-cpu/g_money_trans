import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecentTransactionDto {
  @ApiPropertyOptional({
    example: 'KB',
    description: 'Mã ngân hàng (KB, SH, SHINHAN, HANA...)',
  })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiProperty({
    example: '국민은행',
    description: 'Tên ngân hàng hoặc đơn vị nhận',
  })
  @IsNotEmpty({ message: 'Tên ngân hàng (name) không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'assets/images/bank/bank_kb.png',
    description: 'Đường dẫn ảnh/logo ngân hàng',
  })
  @IsNotEmpty({ message: 'Đường dẫn ảnh (imageUrl) không được để trống' })
  @IsString()
  imageUrl: string;

  @ApiProperty({
    example: '9876 543 210',
    description: 'Số tài khoản nhận',
  })
  @IsNotEmpty({ message: 'Số tài khoản (accountNumber) không được để trống' })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    example: '김철수',
    description: 'Tên chủ tài khoản / người nhận',
  })
  @IsNotEmpty({ message: 'Tên người nhận (accountName) không được để trống' })
  @IsString()
  accountName: string;
}
