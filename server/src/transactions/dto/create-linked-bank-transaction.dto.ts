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
  BankTransactionDirection,
  LinkedBankTransactionStatus,
} from '../schemas/linked-bank-transaction.schema';

export class CreateLinkedBankTransactionDto {
  @ApiPropertyOptional({ example: '670a982910ab355abc1f4577', description: 'ID tài khoản ngân hàng liên kết' })
  @IsOptional()
  @IsString()
  linkedBankAccountId?: string;

  @ApiProperty({ example: 'SHINHAN', description: 'Mã ngân hàng (SHINHAN, NH, KB, HANA,...)' })
  @IsNotEmpty({ message: 'Mã ngân hàng không được để trống' })
  @IsString()
  bankCode: string;

  @ApiPropertyOptional({ example: 'Shinhan Bank', description: 'Tên ngân hàng' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: '110614025931', description: 'Số tài khoản ngân hàng' })
  @IsNotEmpty({ message: 'Số tài khoản không được để trống' })
  @IsString()
  accountNumberMasked: string;

  @ApiProperty({
    enum: BankTransactionDirection,
    example: BankTransactionDirection.OUT,
    description: 'Chiều giao dịch: IN (Cộng tiền +), OUT (Trừ tiền -)',
  })
  @IsNotEmpty({ message: 'Chiều giao dịch không được để trống' })
  @IsEnum(BankTransactionDirection)
  direction: BankTransactionDirection;

  @ApiProperty({ example: 50000, description: 'Số tiền giao dịch' })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Số tiền giao dịch phải lớn hơn 0' })
  amount: number;

  @ApiPropertyOptional({ example: 256901, description: 'Số dư tài khoản sau giao dịch' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  balanceAfter?: number;

  @ApiPropertyOptional({ example: 'KRW', description: 'Đơn vị tiền tệ', default: 'KRW' })
  @IsOptional()
  @IsString()
  currency?: string = 'KRW';

  @ApiProperty({ example: 'Nap tien vao GmoneyPay', description: 'Nội dung giao dịch / Memo' })
  @IsNotEmpty({ message: 'Nội dung giao dịch không được để trống' })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    enum: LinkedBankTransactionStatus,
    default: LinkedBankTransactionStatus.SUCCESS,
    description: 'Trạng thái giao dịch',
  })
  @IsOptional()
  @IsEnum(LinkedBankTransactionStatus)
  status?: LinkedBankTransactionStatus = LinkedBankTransactionStatus.SUCCESS;

  @ApiPropertyOptional({ example: '2026-10-13T03:00:00.000Z', description: 'Thời gian giao dịch' })
  @IsOptional()
  @IsString()
  transactionTime?: string;
}
