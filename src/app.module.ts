import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './domain/auth/auth.module';
import { DogController } from './domain/dog/dog.controller';
import { UserController } from './domain/user/user.controller';
import { UserService } from './domain/user/user.service';
import { DogService } from './domain/dog/dog.service';
import { UserProviderI } from './domain/ports/user-provider-port.model';
import { UserProvider } from './adapter/providers/user.provider';
import { DogProviderI } from './domain/ports/dog-provider-port.model';
import { DogProvider } from './adapter/providers/dog.provider';
import { PrismaService } from './adapter/database/prisma.service';
import { SupabaseService } from './adapter/database/supabase.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
  ],
  controllers: [AppController, DogController, UserController],
  providers: [
    AppService,
    UserService,
    DogService,
    PrismaService,
    SupabaseService,
    {
      provide: UserProviderI,
      useClass: UserProvider,
    },
    {
      provide: DogProviderI,
      useClass: DogProvider,
    },
  ],
})
export class AppModule {}
