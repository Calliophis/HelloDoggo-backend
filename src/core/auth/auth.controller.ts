import { Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/shared/database/db.service';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Public()
@Controller('auth')
export class AuthController {

    protected dbService: DbService;
    
    constructor(
        private authService: AuthService
    ) {
        this.dbService = new DbService('usersDB.json');
    }
    
    @Post('signup')
    async signup(@Body() user: SignupDto ) {
        try {
            return await this.authService.signup(user.firstName, user.lastName, user.email, user.password);
        } catch {
            throw new UnauthorizedException('This email is already used');
        }
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() user: LoginDto): Promise<{ access_token: string }> {
        try {
            return await this.authService.login(user.email, user.password);
        } catch {
            throw new UnauthorizedException('Incorrect email or password');
        }
    }
}