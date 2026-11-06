import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { InternationalTransactionStatus } from '../schemas/international-transaction.schema';

export class QueryInternationalTransactionsDto {
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
    enum: InternationalTransactionStatus,
    description: 'Trạng thái giao dịch (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)',
  })
  @IsOptional()
  @IsEnum(InternationalTransactionStatus)
  status?: InternationalTransactionStatus;

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
