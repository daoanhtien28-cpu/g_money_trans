import { PartialType } from '@nestjs/swagger';
import { CreateRecentTransactionDto } from './create-recent-transaction.dto';

export class UpdateRecentTransactionDto extends PartialType(CreateRecentTransactionDto) {}
