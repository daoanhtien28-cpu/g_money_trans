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
import {
  DomesticSourceType,
  DomesticTransactionStatus,
} from '../schemas/domestic-transaction.schema';

export class CreateDomesticTransactionDto {
  @ApiPropertyOptional({
    enum: DomesticSourceType,
    default: DomesticSourceType.GMONEY_WALLET,
    description: 'Nguồn tiền: GMONEY_PAY hoặc GMONEY_WALLET',
  })
  @IsOptional()
  @IsEnum(DomesticSourceType)
  sourceType?: DomesticSourceType = DomesticSourceType.GMONEY_WALLET;

  @ApiPropertyOptional({ example: '670a982910ab355abc1f4599', description: 'ID tài khoản nguồn' })
  @IsOptional()
  @IsString()
  sourceAccountId?: string;

  @ApiPropertyOptional({ example: 'GMW-KRW-550192', description: 'Số tài khoản nguồn' })
  @IsOptional()
  @IsString()
  sourceAccountNumber?: string;

  @ApiProperty({ example: 'KIM MIN SOO', description: 'Tên người nhận' })
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  @IsString()
  recipientName: string;

  @ApiProperty({ example: '110482910293', description: 'Số tài khoản người nhận' })
  @IsNotEmpty({ message: 'Số tài khoản nhận không được để trống' })
  @IsString()
  recipientAccountNumber: string;

  @ApiProperty({ example: 'SHINHAN', description: 'Mã ngân hàng nhận (SHINHAN, KB, NH, HANA,...)' })
  @IsNotEmpty({ message: 'Mã ngân hàng nhận không được để trống' })
  @IsString()
  recipientBankCode: string;

  @ApiPropertyOptional({ example: 'Shinhan Bank', description: 'Tên ngân hàng nhận' })
  @IsOptional()
  @IsString()
  recipientBankName?: string;

  @ApiProperty({ example: 150000, description: 'Số tiền chuyển (KRW)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Số tiền chuyển phải lớn hơn 0' })
  amount: number;

  @ApiPropertyOptional({ example: 0, description: 'Phí chuyển khoản (KRW)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fee?: number = 0;

  @ApiPropertyOptional({ example: 'KRW', description: 'Đơn vị tiền tệ', default: 'KRW' })
  @IsOptional()
  @IsString()
  currency?: string = 'KRW';

  @ApiPropertyOptional({ example: 'Tien an trua', description: 'Nội dung chuyển khoản / Ghi chú' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    enum: DomesticTransactionStatus,
    default: DomesticTransactionStatus.SUCCESS,
    description: 'Trạng thái giao dịch',
  })
  @IsOptional()
  @IsEnum(DomesticTransactionStatus)
  status?: DomesticTransactionStatus = DomesticTransactionStatus.SUCCESS;

  @ApiPropertyOptional({ example: '2026-10-13T03:00:00.000Z', description: 'Thời gian giao dịch' })
  @IsOptional()
  @IsString()
  transferTime?: string;
}
