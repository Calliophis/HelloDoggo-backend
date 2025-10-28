import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { UserProviderI } from '../ports/user-provider-port.model';
import { UserProvider } from 'src/adapter/providers/user.provider';
import { PrismaService } from 'src/adapter/database/prisma.service';
import { PasswordService } from './password.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2 days' },
      }),
    }),
  ],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    PasswordService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: UserProviderI,
      useClass: UserProvider,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
