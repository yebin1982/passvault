import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for user registration.
 * In a zero-knowledge system, the client generates salts and the master password hash.
 * The raw master password is NEVER sent to the server.
 */
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  masterPasswordHash: string;

  @IsString()
  @IsNotEmpty()
  masterPasswordSalt: string;

  @IsString()
  @IsNotEmpty()
  encryptionKeySalt: string;
}