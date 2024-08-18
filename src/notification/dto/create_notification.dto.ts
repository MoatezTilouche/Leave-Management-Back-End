import { Prop } from "@nestjs/mongoose"
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator"
import { Schema } from "mongoose"

export class CreateNotificationnDto{
    @IsString()
    nameNotif: string;
  
    @IsDate()
    @Type(() => Date)
    dateNotif: Date;
  
  
    
    @IsString()
    contenuNotif: string;
 
    @IsOptional()
    @Prop({ type: Schema.Types.ObjectId, ref: 'Employe' })
    employe: string;

    @IsOptional() 
    @Prop({ type: Schema.Types.ObjectId, ref: 'Administrateur' })
    admin: string;

}