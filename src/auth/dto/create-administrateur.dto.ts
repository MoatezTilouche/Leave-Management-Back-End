import { IsBoolean, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateAdministrateurDto extends CreateUserDto {
  @IsString()
  permissions: string;

  @IsString()
  department:string;

  @IsBoolean()
  manager:boolean;

}
