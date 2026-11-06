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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';
import { RecentTransactionsService } from '../recent-transactions/recent-transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly recentTransactionsService: RecentTransactionsService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách giao dịch nội địa với bộ lọc và phân trang' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch' })
  async getTransactions(
    @CurrentUser() user: UserDocument,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.transactionsService.getTransactions(user.id, query);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Lấy danh sách giao dịch gần đây (đối tượng nhận tiền)' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch gần đây' })
  async getRecentTransactions(@CurrentUser() user: UserDocument) {
    return this.recentTransactionsService.getAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một giao dịch' })
  @ApiResponse({ status: 200, description: 'Chi tiết biên lai giao dịch' })
  @ApiResponse({ status: 404, description: 'Giao dịch không tồn tại' })
  async getTransactionById(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.transactionsService.getTransactionById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch chuyển tiền mới (tự động cập nhật số dư ví)' })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch thành công' })
  @ApiResponse({ status: 400, description: 'Số dư ví không đủ' })
  async createTransaction(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Chỉnh sửa tất cả thông tin giao dịch (tự động bù trừ số dư ví)' })
  @ApiResponse({ status: 200, description: 'Cập nhật giao dịch thành công' })
  @ApiResponse({ status: 400, description: 'Số dư ví không đủ để bù trừ' })
  async updateTransaction(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateTransaction(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một giao dịch' })
  @ApiResponse({ status: 200, description: 'Xóa giao dịch thành công' })
  async deleteTransaction(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.transactionsService.deleteTransaction(user.id, id);
  }
}
