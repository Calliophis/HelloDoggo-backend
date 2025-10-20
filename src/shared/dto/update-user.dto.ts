import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "../../core/auth/enums/role.enum";

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}