import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './schemas/bank.schema';
import { BanksController } from './banks.controller';
import { BanksRepository } from './banks.repository';
import { BanksService } from './banks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
  ],
  controllers: [BanksController],
  providers: [BanksService, BanksRepository],
  exports: [BanksService, BanksRepository],
})
export class BanksModule {}
