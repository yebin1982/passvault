import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GetSaltsDto } from './dto/get-salts.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Step 1 of login: Client requests the salts associated with an email.
   * This is necessary for the client to derive the master password hash locally.
   */
  @Post('salts')
  @HttpCode(HttpStatus.OK)
  getSalts(@Body() getSaltsDto: GetSaltsDto) {
    return this.authService.getSalts(getSaltsDto.email);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.masterPasswordHash);
  }
}