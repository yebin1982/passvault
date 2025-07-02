import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getSalts(email: string): Promise<{ masterPasswordSalt: string; encryptionKeySalt: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // To prevent email enumeration attacks, we return randomly generated (but valid-looking)
      // salts for non-existent users. This makes it impossible for an attacker to
      // determine if an email is registered based on the server's response.
      return {
        masterPasswordSalt: randomBytes(16).toString('hex'),
        encryptionKeySalt: randomBytes(16).toString('hex'),
      };
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