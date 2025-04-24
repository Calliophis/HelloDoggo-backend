import { IsString } from "class-validator";

export class CreateDogDto {
    @IsString()
    name: string;
    
    @IsString()
    sex: 'male'|'female';

    @IsString()
    breed: string;
}