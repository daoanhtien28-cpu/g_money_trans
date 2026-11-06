import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  BankTransactionDirection,
  LinkedBankTransactionStatus,
} from '../schemas/linked-bank-transaction.schema';

export class QueryLinkedBankTransactionsDto {
  @ApiPropertyOptional({
    description: 'Trang hiện tại (bắt đầu từ 1)',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mục trên mỗi trang (tối đa 100)',
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'ID của tài khoản ngân hàng liên kết (ObjectId hoặc UUID)',
    example: '6aab18917ec355abc1f45666',
  })
  @IsOptional()
  @IsString()
  linkedBankAccountId?: string;

  @ApiPropertyOptional({
    description: 'Alias bankId (hỗ trợ lọc theo mã ngân hàng hoặc ID tài khoản liên kết)',
    example: 'SHINHAN',
  })
  @IsOptional()
  @IsString()
  bankId?: string;

  @ApiPropertyOptional({
    enum: BankTransactionDirection,
    description: 'Chiều giao dịch: IN (Cộng tiền), OUT (Trừ tiền)',
  })
  @IsOptional()
  @IsEnum(BankTransactionDirection)
  direction?: BankTransactionDirection;

  @ApiPropertyOptional({
    enum: LinkedBankTransactionStatus,
    description: 'Trạng thái giao dịch (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)',
  })
  @IsOptional()
  @IsEnum(LinkedBankTransactionStatus)
  status?: LinkedBankTransactionStatus;

  @ApiPropertyOptional({
    description: 'Từ ngày (Định dạng YYYY-MM-DD hoặc ISO string)',
    example: '2026-08-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Đến ngày (Định dạng YYYY-MM-DD hoặc ISO string)',
    example: '2026-10-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
