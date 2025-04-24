import { IsOptional, IsString } from "class-validator";

export class UpdateDogDto {
    @IsString()
    @IsOptional()
    name?: string;
    
    @IsString()
    @IsOptional()
    sex?: 'male'|'female';

    @IsString()
    @IsOptional()
    breed?: string;
}