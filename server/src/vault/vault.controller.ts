import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VaultService } from './vault.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CreateBulkItemsDto } from './dto/create-bulk-items.dto';

@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post()
  create(@Req() req, @Body() createVaultItemDto: CreateVaultItemDto) {
    const userId = req.user.userId;
    return this.vaultService.create(userId, createVaultItemDto);
  }

  @Post('bulk')
  createBulk(@Req() req, @Body() createBulkItemsDto: CreateBulkItemsDto) {
    const userId = req.user.userId;
    return this.vaultService.createBulk(userId, createBulkItemsDto.items);
  }

  @Get()
  findAll(@Req() req) {
    const userId = req.user.userId;
    return this.vaultService.findAll(userId);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.vaultService.remove(userId, id);
  }
}