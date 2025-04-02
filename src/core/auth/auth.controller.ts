import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { User } from '../user/user.model';
import { DbService } from 'src/shared/database/db.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './publicDecorator';

@Controller('auth')
export class AuthController {

    protected dbService: DbService;
    
    constructor(
        private authService: AuthService
    ) {
        this.dbService = new DbService('usersDB.json');
    }
    
    @Public()
    @Post('signup')
    signup(@Body() user: User ) {
        return this.authService.signup(user.email, user.password);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() user: User): Promise<{ access_token: string }> {
        return this.authService.login(user.email, user.password);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfiles(@Request() req) {
        return req.user;
    }
}