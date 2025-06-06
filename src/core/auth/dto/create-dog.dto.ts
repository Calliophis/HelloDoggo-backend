import { IsString } from "class-validator";

export class CreateDogDto {
    @IsString()
    name: string;
    
    @IsString()
    sex: 'male'|'female';

    @IsString()
    breed: string;

    @IsString()
    img_url: string;

    @IsString()
    description: string;
}