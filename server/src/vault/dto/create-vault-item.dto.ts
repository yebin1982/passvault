import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVaultItemDto {
  @IsString()
  @IsNotEmpty()
  encryptedData!: string;
}