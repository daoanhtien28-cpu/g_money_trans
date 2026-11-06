import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiPropertyOptional({ example: '6aab18917ec355abc1f45666', description: 'ID tài khoản thực hiện giao dịch' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ example: '6aab18917ec355abc1f45666', description: 'ID ví thực hiện giao dịch (alias cho accountId)' })
  @IsOptional()
  @IsString()
  walletId?: string;

  @ApiProperty({ example: '자연애마트', description: 'Tên đơn vị / người nhận hiển thị to trên thẻ' })
  @IsString()
  title: string;

  @ApiProperty({ example: 9470, description: 'Số tiền giao dịch (KRW)' })
  @IsNumber()
  @Min(1)
  transferAmount: number;

  @ApiPropertyOptional({ example: false, default: false, description: 'false: 출금 (Tiền ra -), true: 입금 (Tiền vào +)' })
  @IsOptional()
  @IsBoolean()
  isDeposit?: boolean;

  @ApiPropertyOptional({ example: '체크', default: '체크', description: 'Tag loại giao dịch (체크, 이체, ATM)' })
  @IsOptional()
  @IsString()
  transferTypeTag?: string;

  @ApiPropertyOptional({ example: 'KB', description: 'Mã ngân hàng người nhận (KB, SH, SHINHAN, HANA...)' })
  @IsOptional()
  @IsString()
  receiverBankCode?: string;

  @ApiPropertyOptional({ example: '국민은행', description: 'Tên ngân hàng người nhận' })
  @IsOptional()
  @IsString()
  receiverBankName?: string;

  @ApiPropertyOptional({ example: '9876 543 210', description: 'Số tài khoản người nhận' })
  @IsOptional()
  @IsString()
  receiverAccountNumber?: string;

  @ApiPropertyOptional({ example: '자연애마트', description: 'Tên người nhận (nếu khác title)' })
  @IsOptional()
  @IsString()
  receiverName?: string;

  @ApiPropertyOptional({ example: 'Mua đồ ăn tối', description: 'Ghi chú / Lời nhắn (메모)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Phí giao dịch' })
  @IsOptional()
  @IsNumber()
  fee?: number;

  @ApiPropertyOptional({ example: '2026.09.16', description: 'Ngày giao dịch (YYYY.MM.DD)' })
  @IsOptional()
  @IsString()
  transferTime?: string;

  @ApiPropertyOptional({ example: 2686, description: 'Số dư sau giao dịch (잔액)' })
  @IsOptional()
  @IsNumber()
  balanceAfter?: number;

  @ApiPropertyOptional({ example: 2686, description: 'Số dư sau giao dịch (tương thích UI cũ)' })
  @IsOptional()
  @IsNumber()
  totalWithdrawalAmount?: number;

  @ApiPropertyOptional({ example: '18:08:45', description: 'Giờ giao dịch (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  transferTimeDetail?: string;

  @ApiPropertyOptional({ example: '1128OTT260916001', description: 'Mã số giao dịch' })
  @IsOptional()
  @IsString()
  transferNumber?: string;

  @ApiPropertyOptional({ example: 'Sh 수협', description: 'Kênh giao dịch' })
  @IsOptional()
  @IsString()
  transferChannel?: string;

  @ApiPropertyOptional({ example: 'SUCCESS', description: 'Trạng thái giao dịch (SUCCESS, PENDING, FAILED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'KRW', description: 'Đơn vị tiền tệ' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Thông tin ngân hàng người gửi' })
  @IsOptional()
  paymentBank?: {
    bankCode?: string;
    name: string;
    imageUrl: string;
    accountNumber: string;
    accountName: string;
  };

  @ApiPropertyOptional({ description: 'Thông tin ngân hàng người nhận' })
  @IsOptional()
  beneficiaryBank?: {
    bankCode?: string;
    name: string;
    imageUrl: string;
    accountNumber: string;
    accountName: string;
  };
}
