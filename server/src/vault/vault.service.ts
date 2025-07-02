import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class VaultService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, createVaultItemDto: CreateVaultItemDto) {
    return this.prisma.vaultItem.create({
      data: {
        userId,
        encryptedData: createVaultItemDto.encryptedData,
      },
    });
  }

  createBulk(userId: string, items: CreateVaultItemDto[]) {
    const itemsToCreate = items.map((item) => ({
      userId,
      encryptedData: item.encryptedData,
    }));

    return this.prisma.vaultItem.createMany({
      data: itemsToCreate,
    });
  }

  findAll(userId: string) {
    return this.prisma.vaultItem.findMany({
      where: { userId },
      select: {
        id: true,
        encryptedData: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.vaultItem.findUnique({
      where: { id },
    });

    if (!item || item.userId !== userId) {
      throw new ForbiddenException('Access to this resource is denied');
    }

    return this.prisma.vaultItem.delete({
      where: { id },
    });
  }
}