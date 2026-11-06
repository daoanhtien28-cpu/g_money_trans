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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountCategory } from './schemas/account.schema';
import { AccountsService } from './accounts.service';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(['accounts', 'wallets'])
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Get()
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản (GmoneyPay, GmoneyWallet duy nhất và danh sách LinkedBankAccounts)',
    description: 'Hỗ trợ cả /api/accounts và /api/wallets. Nếu truyền ?category=LINKED_BANK sẽ trả về riêng mảng các tài khoản ngân hàng liên kết',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: AccountCategory,
    description: 'Lọc riêng theo nhóm tài khoản (nếu cần mảng phẳng: LINKED_BANK)',
  })
  @ApiResponse({ status: 200, description: 'Thông tin tài khoản' })
  async getMyAccounts(
    @CurrentUser() user: UserDocument,
    @Query('category') category?: string,
  ) {
    if (category) {
      return this.accountsService.getMyAccounts(user.id, user.fullName || 'DAO ANH TIEN', category);
    }
    return this.accountsService.getAccountOverview(user.id, user.fullName || 'DAO ANH TIEN');
  }

  @Get('overview')
  @ApiOperation({
    summary: 'Lấy tổng quan thông tin tài khoản (Gồm gmoneyPay, gmoneyWallet và linkedBankAccounts)',
  })
  @ApiResponse({ status: 200, description: 'Tổng quan tài khoản' })
  async getAccountOverview(@CurrentUser() user: UserDocument) {
    return this.accountsService.getAccountOverview(user.id, user.fullName || 'DAO ANH TIEN');
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset tài khoản người dùng về trạng thái mặc định (tiền = 0, xóa liên kết ngân hàng)' })
  @ApiResponse({ status: 200, description: 'Reset tài khoản thành công' })
  async resetAccounts(@CurrentUser() user: UserDocument) {
    return this.accountsService.resetAccountsToZero(user.id, user.fullName || 'DAO ANH TIEN');
  }

  @Get('wallet')
  @ApiOperation({ summary: 'Lấy duy nhất ví GmoneyWallet' })
  @ApiResponse({ status: 200, description: 'Thông tin GmoneyWallet' })
  async getGmoneyWallet(@CurrentUser() user: UserDocument) {
    const overview = await this.accountsService.getAccountOverview(user.id, user.fullName || 'DAO ANH TIEN');
    return overview.gmoneyWallet;
  }

  @Get('pay')
  @ApiOperation({ summary: 'Lấy duy nhất tài khoản GmoneyPay' })
  @ApiResponse({ status: 200, description: 'Thông tin GmoneyPay' })
  async getGmoneyPay(@CurrentUser() user: UserDocument) {
    const overview = await this.accountsService.getAccountOverview(user.id, user.fullName || 'DAO ANH TIEN');
    return overview.gmoneyPay;
  }

  @Get('linked-banks')
  @ApiOperation({ summary: 'Lấy danh sách các tài khoản ngân hàng liên kết' })
  @ApiResponse({ status: 200, description: 'Danh sách ngân hàng liên kết' })
  async getLinkedBanks(@CurrentUser() user: UserDocument) {
    const overview = await this.accountsService.getAccountOverview(user.id, user.fullName || 'DAO ANH TIEN');
    return overview.linkedBankAccounts;
  }

  @Get('main')
  @ApiOperation({ summary: 'Lấy thông tin tài khoản ngân hàng chính (Main) đang sử dụng' })
  @ApiResponse({ status: 200, description: 'Thông tin tài khoản chính' })
  async getMainAccount(@CurrentUser() user: UserDocument) {
    return this.accountsService.getActiveAccount(user.id, user.fullName || 'DAO ANH TIEN');
  }

  @Get('active')
  @ApiOperation({ summary: 'Alias lấy tài khoản đang sử dụng' })
  @ApiResponse({ status: 200, description: 'Thông tin tài khoản đang sử dụng' })
  async getActiveAccount(@CurrentUser() user: UserDocument) {
    return this.accountsService.getActiveAccount(user.id, user.fullName || 'DAO ANH TIEN');
  }

  @Post()
  @ApiOperation({ summary: 'Liên kết tài khoản ngân hàng mới / Tạo tài khoản' })
  @ApiResponse({ status: 201, description: 'Liên kết tài khoản thành công' })
  async createAccount(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountsService.createAccount(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết tài khoản theo ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết tài khoản' })
  async getAccountById(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.accountsService.getAccountById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tài khoản theo ID' })
  @ApiResponse({ status: 200, description: 'Cập nhật tài khoản thành công' })
  async updateAccount(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.updateAccount(user.id, id, dto);
  }

  @Patch(':id/main')
  @ApiOperation({ summary: 'Đặt tài khoản ngân hàng làm tài khoản chính (Main)' })
  @ApiResponse({ status: 200, description: 'Đặt làm tài khoản chính thành công' })
  async setMainAccount(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.accountsService.setMainAccount(user.id, id);
  }

  @Patch(':id/use')
  @ApiOperation({ summary: 'Alias chọn tài khoản làm tài khoản đang sử dụng (using: true)' })
  @ApiResponse({ status: 200, description: 'Cập nhật tài khoản đang sử dụng thành công' })
  async setUsingAccount(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.accountsService.setMainAccount(user.id, id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Đồng bộ số dư ngân hàng qua Open Banking' })
  @ApiResponse({ status: 200, description: 'Đồng bộ thành công' })
  async syncBankBalance(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.accountsService.syncBankBalance(user.id, id);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật tài khoản chính hiện tại (hỗ trợ tương thích ngược)' })
  @ApiResponse({ status: 200, description: 'Cập nhật tài khoản thành công' })
  async updateMyAccount(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.updateMyWallet(user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy liên kết tài khoản ngân hàng theo ID' })
  @ApiResponse({ status: 200, description: 'Hủy liên kết thành công' })
  async deleteAccount(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.accountsService.deleteAccount(user.id, id);
  }
}
