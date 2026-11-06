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
import { CreateDomesticTransactionDto } from './dto/create-domestic-transaction.dto';
import { QueryDomesticTransactionsDto } from './dto/query-domestic-transactions.dto';
import { UpdateDomesticTransactionDto } from './dto/update-domestic-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions - Domestic')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(['domestic-transaction', 'domestic-transactions'])
export class DomesticTransactionController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách lịch sử chuyển tiền nội địa (Hỗ trợ GmoneyPay & GmoneyWallet)',
    description: 'Hỗ trợ lọc theo trạng thái, nguồn tiền (GmoneyPay/GmoneyWallet), khoảng ngày và phân trang.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch chuyển tiền nội địa' })
  async getDomesticTransactions(
    @CurrentUser() user: UserDocument,
    @Query() query: QueryDomesticTransactionsDto,
  ) {
    return this.transactionsService.getDomesticTransactions(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới một giao dịch chuyển tiền nội địa' })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch nội địa thành công' })
  async createDomesticTransaction(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateDomesticTransactionDto,
  ) {
    return this.transactionsService.createDomesticTransaction(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một giao dịch chuyển tiền nội địa' })
  @ApiResponse({ status: 200, description: 'Chi tiết giao dịch nội địa' })
  @ApiResponse({ status: 404, description: 'Giao dịch không tồn tại' })
  async getDomesticTransactionById(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.transactionsService.getDomesticTransactionById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin giao dịch chuyển tiền nội địa' })
  @ApiResponse({ status: 200, description: 'Cập nhật giao dịch thành công' })
  async updateDomesticTransaction(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateDomesticTransactionDto,
  ) {
    return this.transactionsService.updateDomesticTransaction(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một giao dịch chuyển tiền nội địa' })
  @ApiResponse({ status: 200, description: 'Xóa giao dịch thành công' })
  async deleteDomesticTransaction(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.transactionsService.deleteDomesticTransaction(user.id, id);
  }
}
