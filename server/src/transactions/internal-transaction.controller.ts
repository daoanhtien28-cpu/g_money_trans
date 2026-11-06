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
import { CreateInternationalTransactionDto } from './dto/create-international-transaction.dto';
import { QueryInternationalTransactionsDto } from './dto/query-international-transactions.dto';
import { UpdateInternationalTransactionDto } from './dto/update-international-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions - International')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(['internal-transaction', 'internal-transactions'])
export class InternalTransactionController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách lịch sử chuyển tiền quốc tế (Chỉ dùng GmoneyPay)',
    description: 'Hỗ trợ lọc theo trạng thái, khoảng ngày và phân trang. Dữ liệu scoped theo người dùng đăng nhập.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch chuyển tiền quốc tế' })
  async getInternationalTransactions(
    @CurrentUser() user: UserDocument,
    @Query() query: QueryInternationalTransactionsDto,
  ) {
    return this.transactionsService.getInternationalTransactions(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới một giao dịch chuyển tiền quốc tế' })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch quốc tế thành công' })
  async createInternationalTransaction(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateInternationalTransactionDto,
  ) {
    return this.transactionsService.createInternationalTransaction(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một giao dịch chuyển tiền quốc tế' })
  @ApiResponse({ status: 200, description: 'Chi tiết giao dịch quốc tế' })
  @ApiResponse({ status: 404, description: 'Giao dịch không tồn tại' })
  async getInternationalTransactionById(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.transactionsService.getInternationalTransactionById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin giao dịch chuyển tiền quốc tế' })
  @ApiResponse({ status: 200, description: 'Cập nhật giao dịch thành công' })
  async updateInternationalTransaction(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateInternationalTransactionDto,
  ) {
    return this.transactionsService.updateInternationalTransaction(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một giao dịch chuyển tiền quốc tế' })
  @ApiResponse({ status: 200, description: 'Xóa giao dịch thành công' })
  async deleteInternationalTransaction(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.transactionsService.deleteInternationalTransaction(user.id, id);
  }
}
