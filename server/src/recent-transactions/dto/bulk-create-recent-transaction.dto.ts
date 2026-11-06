import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateRecentTransactionDto } from './create-recent-transaction.dto';

export class BulkCreateRecentTransactionDto {
  @ApiProperty({
    type: [CreateRecentTransactionDto],
    description: 'Danh sách các giao dịch gần đây cần nhập/thêm',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecentTransactionDto)
  items: CreateRecentTransactionDto[];
}
