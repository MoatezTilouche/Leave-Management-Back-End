
import { IsNumber, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Prop } from '@nestjs/mongoose';


export class CreateEmployeDto extends CreateUserDto {
  @IsString()
  department: string;

  @IsNumber()
  soldeConges: number;

  
  @IsNumber()
  soldeMaladie: number;

 

}
