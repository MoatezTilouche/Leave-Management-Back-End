import { IsString, IsEmail, IsOptional, MinLength, IsNumber } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;


    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    role: string;
    
    @IsOptional()
    dateInscription: Date;

    
    @IsOptional()
    @IsString()
    photo?: string;

    @IsNumber()
    age:number

    @IsString()
    sexe:string

    
}
