import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { BulkCreateRecentTransactionDto } from './dto/bulk-create-recent-transaction.dto';
import { CreateRecentTransactionDto } from './dto/create-recent-transaction.dto';
import { UpdateRecentTransactionDto } from './dto/update-recent-transaction.dto';
import { RecentTransactionsService } from './recent-transactions.service';

@ApiTags('Recent Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recent-transactions')
export class RecentTransactionsController {
  constructor(
    private readonly recentTransactionsService: RecentTransactionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các giao dịch gần đây của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các giao dịch gần đây',
    schema: {
      example: [
        {
          id: '66f2b45a...',
          bankCode: 'KB',
          name: '국민은행',
          imageUrl: 'assets/images/bank/bank_kb.png',
          accountNumber: '9876 543 210',
          accountName: '자연애마트',
          createdAt: '2026-09-24T10:00:00.000Z',
          updatedAt: '2026-09-24T10:00:00.000Z',
        },
      ],
    },
  })
  async getAllRecent(@CurrentUser() user: UserDocument) {
    return this.recentTransactionsService.getAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một giao dịch gần đây' })
  @ApiResponse({ status: 200, description: 'Chi tiết giao dịch gần đây' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch gần đây' })
  async getRecentById(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.recentTransactionsService.getById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm mới một hoặc nhiều giao dịch gần đây' })
  @ApiResponse({ status: 201, description: 'Thêm giao dịch gần đây thành công' })
  async createRecent(
    @CurrentUser() user: UserDocument,
    @Body() dto: any,
  ) {
    // Hỗ trợ cả trường hợp gửi mảng trực tiếp vào POST /recent-transactions
    if (Array.isArray(dto)) {
      return this.recentTransactionsService.bulkCreate(user.id, dto);
    }
    if (dto && Array.isArray(dto.items)) {
      return this.recentTransactionsService.bulkCreate(user.id, dto.items);
    }
    return this.recentTransactionsService.create(user.id, dto as CreateRecentTransactionDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Nhập danh sách hàng loạt giao dịch gần đây' })
  @ApiBody({
    type: BulkCreateRecentTransactionDto,
    description: 'Có thể truyền { items: [...] } hoặc mảng JSON trực tiếp [...]',
  })
  @ApiResponse({ status: 201, description: 'Nhập danh sách thành công' })
  async bulkCreateRecent(
    @CurrentUser() user: UserDocument,
    @Body() body: any,
  ) {
    const items = Array.isArray(body) ? body : (body?.items || []);
    return this.recentTransactionsService.bulkCreate(user.id, items);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật / sửa thông tin một giao dịch gần đây' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch' })
  async updateRecent(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateRecentTransactionDto,
  ) {
    return this.recentTransactionsService.update(user.id, id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật / thay thế thông tin một giao dịch gần đây' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async putRecent(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateRecentTransactionDto,
  ) {
    return this.recentTransactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một giao dịch gần đây theo ID' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteRecent(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.recentTransactionsService.delete(user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Xóa toàn bộ danh sách giao dịch gần đây của người dùng' })
  @ApiResponse({ status: 200, description: 'Đã xóa tất cả giao dịch gần đây' })
  async deleteAllRecent(@CurrentUser() user: UserDocument) {
    return this.recentTransactionsService.deleteAll(user.id);
  }
}
