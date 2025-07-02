import { IsEmail } from 'class-validator';

export class GetSaltsDto {
  @IsEmail()
  email!: string;
}