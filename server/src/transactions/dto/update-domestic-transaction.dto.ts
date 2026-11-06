import { PartialType } from '@nestjs/swagger';
import { CreateDomesticTransactionDto } from './create-domestic-transaction.dto';

export class UpdateDomesticTransactionDto extends PartialType(
  CreateDomesticTransactionDto,
) {}
