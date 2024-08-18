import { Prop } from "@nestjs/mongoose"
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator"
import { Schema } from "mongoose"

export class CreateCongeDto{
    @IsString()
    typeConge: string;
  
    @IsDate()
    @Type(() => Date)
    dateDebut: Date;
  
    @IsDate()
    @Type(() => Date)
    dateFin: Date;
  
    @IsOptional()
    @IsString()
    commentaire?: string;
  
    @IsDate()
    @Type(() => Date)
    dateDemande: Date;
  
    @IsOptional()
    @IsString()
    statut?: string; // e.g., 'pending', 'approved', 'rejected'
  
    @IsOptional()
    @IsString()
    attestation?: string;

    @Prop({ type: Schema.Types.ObjectId, ref: 'Employe' })
    employe: string;



}