import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VaultService } from './vault.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CreateBulkItemsDto } from './dto/create-bulk-items.dto';
import { Request } from 'express';

// Define an interface for the request object after JWT validation
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() createVaultItemDto: CreateVaultItemDto) {
    const userId = req.user.userId;
    return this.vaultService.create(userId, createVaultItemDto);
  }

  @Post('bulk')
  createBulk(@Req() req: AuthenticatedRequest, @Body() createBulkItemsDto: CreateBulkItemsDto) {
    const userId = req.user.userId;
    return this.vaultService.createBulk(userId, createBulkItemsDto.items);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.vaultService.findAll(userId);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.vaultService.remove(userId, id);
  }
}