import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmployeDto  {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsNumber()
  soldeConges?: number;

  @IsOptional()
  @IsNumber()
  soldeMaladie: number;


  @IsOptional()
  dateInscription?: Date;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsNumber()
  age:number

  @IsOptional()
  @IsString()
  sexe:string

}
