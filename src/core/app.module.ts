import { Module } from '@nestjs/common';
import { DogController } from 'src/core/dog/dog.controller';
import { UserController } from 'src/core/user/user.controller';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: 'development.env' }),
      JwtModule.registerAsync({
                  inject: [ConfigService],
                  useFactory: (configService: ConfigService) => ({
                      secret: configService.get<string>('JWT_SECRET'),
                      signOptions: { expiresIn: '120s' }
                  }),        
              }), 
    AuthModule],
  controllers: [AppController, DogController, UserController],
  providers: [AppService],
})
export class AppModule {}

