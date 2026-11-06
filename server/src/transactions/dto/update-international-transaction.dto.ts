import { PartialType } from '@nestjs/swagger';
import { CreateInternationalTransactionDto } from './create-international-transaction.dto';

export class UpdateInternationalTransactionDto extends PartialType(
  CreateInternationalTransactionDto,
) {}
