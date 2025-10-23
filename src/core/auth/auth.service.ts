import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Role } from './enums/role.enum';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { UUID } from 'crypto';

export interface TokenPayload {
  sub: UUID;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const existingUser = await this.userService.user({
      email,
    });

    if (existingUser) {
      throw new Error('This email is already used');
    } else {
      const hash = await this.hashPassword(password);
      return this.userService.createUser({
        first_name: firstName,
        last_name: lastName,
        email,
        password: hash,
        role: Role.USER,
      });
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; role: Role }> {
    const existingUser = await this.userService.user({
      email,
    });

    if (!existingUser) {
      throw new Error('Incorrect email or password');
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      throw new Error('Incorrect email or password');
    }

    const payload: TokenPayload = {
      sub: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    return {
      accessToken: this.jwtService.sign(payload, { secret }),
      role: existingUser.role,
    };
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async verifyJwtUser(request: Request) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new Error('No token');
    }

    const payload: TokenPayload = await this.jwtService.verifyAsync(token);
    request['user'] = payload;
  }

  async filterUpdate(updatedUser: Partial<User>, allowedFields: string[]) {
    const filteredUpdate = Object.fromEntries(
      Object.entries(updatedUser).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined,
      ),
    );

    if (!Object.keys(filteredUpdate).length) {
      throw new Error();
    }

    if (typeof filteredUpdate.password === 'string') {
      const hashedPassword = await this.hashPassword(filteredUpdate.password);
      filteredUpdate.password = hashedPassword;
    }

    return filteredUpdate;
  }
}
