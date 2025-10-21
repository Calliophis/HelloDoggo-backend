import { Module } from '@nestjs/common';
import { DogController } from 'src/core/dog/dog.controller';
import { UserController } from 'src/core/user/user.controller';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env' 
    }), 
    AuthModule
  ],
  controllers: [AppController, DogController, UserController],
  providers: [AppService],
})
export class AppModule {}
