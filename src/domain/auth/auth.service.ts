import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Role } from './enums/role.enum';
import { UserService } from '../user/user.service';
import { UUID } from 'crypto';
import { from, map, Observable, switchMap } from 'rxjs';
import { User } from '../user/models/user.model';

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

  hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 10));
  }

  signup(firstName: string, lastName: string, email: string, password: string) {
    return this.userService.getUserByEmail(email).pipe(
      switchMap((existingUser) => {
        if (existingUser) {
          throw new Error('This email is already used');
        }
        return this.hashPassword(password);
      }),
      switchMap((hash) => {
        return this.userService.createUser({
          firstName,
          lastName,
          email,
          password: hash,
          role: Role.USER,
        });
      }),
    );
  }

  login(
    email: string,
    password: string,
  ): Observable<{ accessToken: string; role: Role }> {
    return this.userService.getUserByEmail(email).pipe(
      switchMap((existingUser) => {
        if (!existingUser) {
          throw new Error('Incorrect email or password');
        }
        return from(bcrypt.compare(password, existingUser.password)).pipe(
          map((isMatch) => {
            if (!isMatch) {
              throw new Error('Incorrect email or password');
            }
            return this.createToken(existingUser);
          }),
        );
      }),
    );
  }

  createToken(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    return {
      accessToken: this.jwtService.sign(payload, { secret }),
      role: user.role,
    };
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  verifyJwtUser(request: Request): Observable<TokenPayload> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new Error('No token');
    }
    return from(this.jwtService.verifyAsync<TokenPayload>(token)).pipe(
      map((payload) => {
        return (request['user'] = payload);
      }),
    );
  }
}
