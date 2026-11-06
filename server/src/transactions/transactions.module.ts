import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { BanksModule } from '../banks/banks.module';
import { RecentTransactionsModule } from '../recent-transactions/recent-transactions.module';
import { AccountsModule } from '../accounts/accounts.module';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import {
  InternationalTransaction,
  InternationalTransactionSchema,
} from './schemas/international-transaction.schema';
import {
  DomesticTransaction,
  DomesticTransactionSchema,
} from './schemas/domestic-transaction.schema';
import {
  LinkedBankTransaction,
  LinkedBankTransactionSchema,
} from './schemas/linked-bank-transaction.schema';
import { TransactionsController } from './transactions.controller';
import { InternalTransactionController } from './internal-transaction.controller';
import { DomesticTransactionController } from './domestic-transaction.controller';
import { LinkBankTransactionController } from './link-bank-transaction.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: InternationalTransaction.name, schema: InternationalTransactionSchema },
      { name: DomesticTransaction.name, schema: DomesticTransactionSchema },
      { name: LinkedBankTransaction.name, schema: LinkedBankTransactionSchema },
    ]),
    PassportModule,
    AccountsModule,
    BanksModule,
    RecentTransactionsModule,
  ],
  controllers: [
    TransactionsController,
    InternalTransactionController,
    DomesticTransactionController,
    LinkBankTransactionController,
  ],
  providers: [TransactionsService, TransactionsRepository],
  exports: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule { }

