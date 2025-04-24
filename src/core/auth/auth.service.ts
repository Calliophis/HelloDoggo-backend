
import { Injectable } from '@nestjs/common';
import { DbService } from 'src/shared/database/db.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from "express";

@Injectable()
export class AuthService {
    private dbService: DbService;

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {
        this.dbService = new DbService('usersDB.json');
    }

    async hashPassword(password: string): Promise<string> {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    }

    async signup(email: string, password: string) {
        
        const existingUser = this.dbService.findByEmail(email);
        
        if (existingUser) {
            throw new Error('This email is already used');
        } else {
            const hash = await this.hashPassword(password);
            return this.dbService.create({email, password: hash, role: 'user'});
        }
    }

    async login(email: string, password: string): Promise<{ access_token: string }> {
        
        const existingUser = this.dbService.findByEmail(email);
        
        if (!existingUser) {
            throw new Error('Incorrect email or password');
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            throw new Error('Incorrect email or password');
        }
        
        const payload = { sub: existingUser.id, email: existingUser.email, role: existingUser.role }
        const secret = this.configService.get<string>('JWT_SECRET');
        return { access_token: this.jwtService.sign(payload, { secret }) };
    }

    extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    async verifyJwtUser(request: Request) {
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new Error('No token');
        }
        const payload = await this.jwtService.verifyAsync(
            token,
            {
                secret: this.configService.get<string>('JWT_SECRET')
            }
        );
        request['user'] = payload;
    }

    async filterUpdate(updatedUser, allowedFields) {
        const filteredUpdate = Object.fromEntries(
            Object.entries(updatedUser).filter(([key]) => allowedFields.includes(key))
        );
        
        if (!Object.keys(filteredUpdate).length) {
        throw new Error();
        }
        
        if (typeof filteredUpdate.password === 'string') {
        const hashedPassword = await this.hashPassword(filteredUpdate.password);
        filteredUpdate.password = hashedPassword;
        }
       
        return filteredUpdate;
    }  
}
