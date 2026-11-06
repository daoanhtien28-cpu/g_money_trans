import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AccountCategory, AccountStatus, AccountType } from '../schemas/account.schema';

export class CreateAccountDto {
  @ApiPropertyOptional({
    example: '1234 5678 9012',
    description: 'Số tài khoản ví (tự sinh nếu không truyền)',
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ example: 'DAO ANH TIEN', description: 'Tên chủ sở hữu tài khoản' })
  @IsString()
  ownerName: string;

  @ApiPropertyOptional({
    example: 'GmoneyPay',
    description: 'Tên hiển thị tài khoản (GmoneyPay, GmoneyWallet, Shinhan Bank...)',
  })
  @IsOptional()
  @IsString()
  accountTitle?: string;

  @ApiPropertyOptional({
    enum: AccountCategory,
    default: AccountCategory.LINKED_BANK,
    description: 'Phân loại tài khoản (GMONEY_PAY, GMONEY_WALLET, LINKED_BANK)',
  })
  @IsOptional()
  @IsEnum(AccountCategory)
  category?: AccountCategory;

  @ApiPropertyOptional({ example: 'KRW', default: 'KRW', description: 'Loại tiền tệ' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Số dư khả dụng' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableBalance?: number;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Số dư khả dụng hiển thị/chỉnh sửa' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableBalanceEdit?: number;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Tổng số dư' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBalance?: number;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Số dư đóng băng' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  frozenBalance?: number;

  @ApiPropertyOptional({
    enum: AccountType,
    default: AccountType.PERSONAL,
    description: 'Loại tài khoản',
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @ApiPropertyOptional({
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    description: 'Trạng thái tài khoản',
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional({ example: 'SHINHAN', description: 'Mã ngân hàng liên kết (SHINHAN, NH, KB, WOORI...)' })
  @IsOptional()
  @IsString()
  linkedBankCode?: string;

  @ApiPropertyOptional({ example: 'Shinhan Bank', description: 'Tên ngân hàng liên kết' })
  @IsOptional()
  @IsString()
  linkedBankName?: string;

  @ApiPropertyOptional({ example: '110614025931', description: 'Số tài khoản ngân hàng liên kết' })
  @IsOptional()
  @IsString()
  linkedBankAccount?: string;

  @ApiPropertyOptional({ example: 'assets/images/bank/bank_shinhan.png', description: 'Đường dẫn ảnh logo' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, default: false, description: 'Đánh dấu tài khoản đang được sử dụng' })
  @IsOptional()
  @IsBoolean()
  using?: boolean;

  @ApiPropertyOptional({ example: true, default: false, description: 'Đánh dấu tài khoản chính (Main)' })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ example: true, default: false, description: 'Alias cho isMain/using' })
  @IsOptional()
  @IsBoolean()
  main?: boolean;

  @ApiPropertyOptional({
    example: ['TOP_UP', 'DOMESTIC_TRANSFER'],
    description: 'Danh sách tính năng khả dụng',
  })
  @IsOptional()
  @IsArray()
  availableActions?: string[];
}
