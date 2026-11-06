import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BanksService } from './banks.service';

@ApiTags('Banks')
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các ngân hàng (sắp xếp theo thứ tự ưu tiên)' })
  @ApiResponse({ status: 200, description: 'Danh sách ngân hàng' })
  async getAllBanks() {
    return this.banksService.getAllBanks();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Lấy chi tiết ngân hàng theo mã code (vd: HANA, KB, SHINHAN...)' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết ngân hàng' })
  @ApiResponse({ status: 404, description: 'Ngân hàng không tồn tại' })
  async getBankByCode(@Param('code') code: string) {
    return this.banksService.getBankByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết ngân hàng theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết ngân hàng' })
  @ApiResponse({ status: 404, description: 'Ngân hàng không tồn tại' })
  async getBankById(@Param('id') id: string) {
    return this.banksService.getBankById(id);
  }
}
