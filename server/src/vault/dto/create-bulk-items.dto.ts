import { IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVaultItemDto } from './create-vault-item.dto';

export class CreateBulkItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVaultItemDto)
  @IsNotEmpty()
  items!: CreateVaultItemDto[];
}