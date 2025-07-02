import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  /**
   * The hash of the master password, computed on the client.
   */
  @IsString()
  @IsNotEmpty()
  masterPasswordHash: string;
}