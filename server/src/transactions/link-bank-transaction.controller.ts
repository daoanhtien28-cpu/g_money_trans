import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateLinkedBankTransactionDto } from './dto/create-linked-bank-transaction.dto';
import { QueryLinkedBankTransactionsDto } from './dto/query-linked-bank-transactions.dto';
import { UpdateLinkedBankTransactionDto } from './dto/update-linked-bank-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions - Linked Bank')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(['link-bank-transaction', 'link-bank-transactions'])
export class LinkBankTransactionController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy lịch sử giao dịch ngân hàng liên kết (Open Banking)',
    description: 'Hỗ trợ lọc theo bankId / linkedBankAccountId, chiều giao dịch (IN/OUT), trạng thái, khoảng ngày và phân trang.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch ngân hàng liên kết' })
  async getLinkedBankTransactions(
    @CurrentUser() user: UserDocument,
    @Query() query: QueryLinkedBankTransactionsDto,
  ) {
    return this.transactionsService.getLinkedBankTransactions(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới một biến động số dư ngân hàng liên kết' })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch ngân hàng thành công' })
  async createLinkedBankTransaction(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateLinkedBankTransactionDto,
  ) {
    return this.transactionsService.createLinkedBankTransaction(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một giao dịch ngân hàng liên kết' })
  @ApiResponse({ status: 200, description: 'Chi tiết giao dịch ngân hàng' })
  @ApiResponse({ status: 404, description: 'Giao dịch không tồn tại' })
  async getLinkedBankTransactionById(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.transactionsService.getLinkedBankTransactionById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin giao dịch ngân hàng liên kết' })
  @ApiResponse({ status: 200, description: 'Cập nhật giao dịch thành công' })
  async updateLinkedBankTransaction(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateLinkedBankTransactionDto,
  ) {
    return this.transactionsService.updateLinkedBankTransaction(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một giao dịch ngân hàng liên kết' })
  @ApiResponse({ status: 200, description: 'Xóa giao dịch thành công' })
  async deleteLinkedBankTransaction(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.transactionsService.deleteLinkedBankTransaction(user.id, id);
  }
}
