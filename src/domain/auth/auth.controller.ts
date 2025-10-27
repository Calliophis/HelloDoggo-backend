import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { catchError, Observable } from 'rxjs';
import { Role } from './enums/role.enum';
import { User } from '../user/models/user.model';
import { SignupDto } from './models/dto/signup.dto';
import { LoginDto } from './models/dto/login.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() user: SignupDto): Observable<User> {
    return this.authService
      .signup(user.firstName, user.lastName, user.email, user.password)
      .pipe(
        catchError(() => {
          throw new UnauthorizedException('This email is already used');
        }),
      );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() user: LoginDto,
  ): Observable<{ accessToken: string; role: Role }> {
    return this.authService.login(user.email, user.password).pipe(
      catchError(() => {
        throw new UnauthorizedException('Incorrect email or password');
      }),
    );
  }
}
