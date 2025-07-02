import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getSalts(email: string): Promise<{ masterPasswordSalt: string; encryptionKeySalt: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Note: We throw an error here, but in a real-world high-security scenario,
      // you might return a random dummy salt to prevent email enumeration.
      throw new NotFoundException('User not found');
    }
    return {
      masterPasswordSalt: user.masterPasswordSalt,
      encryptionKeySalt: user.encryptionKeySalt,
    };
  }

  async login(email: string, masterPasswordHash: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(email);

    // IMPORTANT: This is a simple string comparison because the client has already
    // performed the complex hashing (e.g., with Argon2).
    if (user?.masterPasswordHash !== masterPasswordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}