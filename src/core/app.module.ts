import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { DogController } from './dog/dog.controller';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { DogService } from './dog/dog.service';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env' 
    }), 
    AuthModule
  ],
  controllers: [AppController, DogController, UserController],
  providers: [AppService, UserService, DogService],
})
export class AppModule {}
