import { IsOptional, IsString, IsEmail, MinLength, IsBoolean } from "class-validator";


export class UpdateAdminDto{
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
  permissions: string;

  @IsOptional()
  @IsString()
  department:string;

  @IsOptional()
  @IsBoolean()
  manager:boolean;

}