import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TransactionTypeFilter {
  ALL = 'ALL',               // 전체 (Tất cả)
  DEPOSIT = 'DEPOSIT',       // 입금 (Tiền vào)
  WITHDRAWAL = 'WITHDRAWAL', // 출금 (Tiền ra)
}

export enum TransactionSortOrder {
  NEWEST = 'NEWEST',         // 최신순 (Mới nhất trước)
  OLDEST = 'OLDEST',         // 과거순 (Cũ nhất trước)
}

export enum TransactionSearchType {
  ALL = 'ALL',               // Tìm trong cả tên và memo
  HOLDER = 'HOLDER',         // 예금주명 (Tên người gửi / người nhận)
  MEMO = 'MEMO',             // 메모 (Nội dung / Ghi chú)
}

export class QueryTransactionsDto {
  @ApiPropertyOptional({
    enum: TransactionTypeFilter,
    default: TransactionTypeFilter.ALL,
    description: 'Loại giao dịch: ALL (전체), DEPOSIT (입금), WITHDRAWAL (출금)',
  })
  @IsOptional()
  @IsEnum(TransactionTypeFilter)
  type?: TransactionTypeFilter = TransactionTypeFilter.ALL;

  @ApiPropertyOptional({
    enum: TransactionSortOrder,
    default: TransactionSortOrder.NEWEST,
    description: 'Thứ tự sắp xếp: NEWEST (최신순 - mới nhất), OLDEST (과거순 - cũ nhất)',
  })
  @IsOptional()
  @IsEnum(TransactionSortOrder)
  sortOrder?: TransactionSortOrder = TransactionSortOrder.NEWEST;

  @ApiPropertyOptional({
    example: '1M',
    description: 'Khoảng thời gian nhanh: 1M (1개월), 3M (3개월), 6M (6개월), 1Y (1년)',
  })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({
    example: '2026-08-01',
    description: 'Từ ngày (직접입력: YYYY-MM-DD hoặc YYYY.MM.DD)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-17',
    description: 'Đến ngày (직접입력: YYYY-MM-DD hoặc YYYY.MM.DD)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: TransactionSearchType,
    default: TransactionSearchType.ALL,
    description: 'Loại tìm kiếm: HOLDER (예금주명), MEMO (메모), ALL',
  })
  @IsOptional()
  @IsEnum(TransactionSearchType)
  searchType?: TransactionSearchType = TransactionSearchType.ALL;

  @ApiPropertyOptional({
    example: '자연애마트',
    description: 'Từ khóa tìm kiếm theo tên hoặc memo',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Số tiền giao dịch tối thiểu (min amount)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Số tiền giao dịch tối đa (max amount)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ default: 1, description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, description: 'Số lượng item mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
