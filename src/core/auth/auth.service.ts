
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/shared/database/db.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private dbService: DbService;

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {
        this.dbService = new DbService('usersDB.json');
    }

    async signup(email: string, password: string) {
        
        const existingUser = this.dbService.findByEmail(email);
        
        if (existingUser) {
            throw new Error('This email is already used');
        } else {
            const hash = await bcrypt.hash(password, 10);
            return this.dbService.create({email, password: hash});
        }
    }

    async login(email: string, password: string): Promise<{ access_token: string }> {
        
        const existingUser = this.dbService.findByEmail(email);
        
        if (!existingUser) {
            throw new UnauthorizedException('Incorrect username or password')
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            throw new UnauthorizedException('Incorrect username or password');
        }
        
        const payload = { sub: existingUser.id, email: existingUser.email }
        const secret = this.configService.get<string>('JWT_SECRET');
        return { access_token: this.jwtService.sign(payload, { secret }) };
    }
}
