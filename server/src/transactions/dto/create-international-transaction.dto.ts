import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { InternationalTransactionStatus } from '../schemas/international-transaction.schema';

export class CreateInternationalTransactionDto {
  @ApiProperty({ example: 'NGUYEN VAN A', description: 'Tên người nhận' })
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  @IsString()
  recipientName: string;

  @ApiProperty({ example: '19036782910123', description: 'Số tài khoản nhận' })
  @IsNotEmpty({ message: 'Số tài khoản nhận không được để trống' })
  @IsString()
  recipientAccountNumber: string;

  @ApiProperty({ example: 'TCB', description: 'Mã ngân hàng nhận' })
  @IsNotEmpty({ message: 'Mã ngân hàng nhận không được để trống' })
  @IsString()
  recipientBankCode: string;

  @ApiProperty({ example: 'Techcombank', description: 'Tên ngân hàng nhận' })
  @IsNotEmpty({ message: 'Tên ngân hàng nhận không được để trống' })
  @IsString()
  recipientBankName: string;

  @ApiPropertyOptional({ example: 'VN', description: 'Mã quốc gia nhận', default: 'VN' })
  @IsOptional()
  @IsString()
  recipientCountry?: string = 'VN';

  @ApiProperty({ example: 1000000, description: 'Số tiền gửi (KRW)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1000, { message: 'Số tiền gửi tối thiểu 1,000 KRW' })
  sendAmount: number;

  @ApiPropertyOptional({ example: 'KRW', description: 'Loại tiền gửi', default: 'KRW' })
  @IsOptional()
  @IsString()
  sendCurrency?: string = 'KRW';

  @ApiPropertyOptional({ example: 18250000, description: 'Số tiền nhận (VND, USD,...)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  receiveAmount?: number;

  @ApiPropertyOptional({ example: 'VND', description: 'Loại tiền nhận', default: 'VND' })
  @IsOptional()
  @IsString()
  receiveCurrency?: string = 'VND';

  @ApiPropertyOptional({ example: 18.25, description: 'Tỷ giá quy đổi' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  exchangeRate?: number = 18.25;

  @ApiPropertyOptional({ example: 5000, description: 'Phí chuyển tiền (KRW)', default: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  transferFee?: number = 5000;

  @ApiPropertyOptional({ example: 2000, description: 'Phí chuyển đổi ngoại tệ (KRW)', default: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  conversionFee?: number = 2000;

  @ApiPropertyOptional({ example: 'DAO ANH TIEN', description: 'Tên người gửi' })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiPropertyOptional({ example: '01012345678', description: 'SĐT người gửi' })
  @IsOptional()
  @IsString()
  senderPhone?: string;

  @ApiPropertyOptional({ example: 'GMONEY_PAY', description: 'Loại tài khoản nguồn' })
  @IsOptional()
  @IsString()
  sourceAccountType?: string;

  @ApiPropertyOptional({ example: 'GMP-KRW-882910', description: 'Số tài khoản GmoneyPay nguồn' })
  @IsOptional()
  @IsString()
  sourceAccountNumber?: string;

  @ApiPropertyOptional({ example: 1007000, description: 'Tổng tiền trừ = sendAmount + transferFee + conversionFee' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalDebited?: number;

  @ApiPropertyOptional({
    enum: InternationalTransactionStatus,
    default: InternationalTransactionStatus.SUCCESS,
    description: 'Trạng thái giao dịch',
  })
  @IsOptional()
  @IsEnum(InternationalTransactionStatus)
  status?: InternationalTransactionStatus = InternationalTransactionStatus.SUCCESS;

  @ApiPropertyOptional({ example: '2026-10-13T03:00:00.000Z', description: 'Thời gian giao dịch' })
  @IsOptional()
  @IsString()
  transferTime?: string;
}
