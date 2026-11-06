import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { BanksModule } from '../banks/banks.module';
import { RecentTransactionsController } from './recent-transactions.controller';
import { RecentTransactionsRepository } from './recent-transactions.repository';
import { RecentTransactionsService } from './recent-transactions.service';
import {
  RecentTransaction,
  RecentTransactionSchema,
} from './schemas/recent-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecentTransaction.name, schema: RecentTransactionSchema },
    ]),
    PassportModule,
    BanksModule,
  ],
  controllers: [RecentTransactionsController],
  providers: [RecentTransactionsService, RecentTransactionsRepository],
  exports: [RecentTransactionsService, RecentTransactionsRepository],
})
export class RecentTransactionsModule { }
