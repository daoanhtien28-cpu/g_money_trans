import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { BanksModule } from './banks/banks.module';
import { RecentTransactionsModule } from './recent-transactions/recent-transactions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AccountsModule } from './accounts/accounts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Config — loaded globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      // Load đúng file theo môi trường: .env.production | .env.development | .env
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
    }),

    // Database (MongoDB via Mongoose)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),

    // Feature modules
    UsersModule,
    AuthModule,
    AccountsModule,
    BanksModule,
    TransactionsModule,
    RecentTransactionsModule,
  ],
})
export class AppModule {}

