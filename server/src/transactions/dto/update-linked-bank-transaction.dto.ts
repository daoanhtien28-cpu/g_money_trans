import { PartialType } from '@nestjs/swagger';
import { CreateLinkedBankTransactionDto } from './create-linked-bank-transaction.dto';

export class UpdateLinkedBankTransactionDto extends PartialType(
  CreateLinkedBankTransactionDto,
) {}
