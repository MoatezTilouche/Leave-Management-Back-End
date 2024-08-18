import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import {  Schema as MongooseSchema } from 'mongoose';

@Schema({
    timestamps: true
})
export class Conge {
  

  @Prop()
  typeConge: string;

  @Prop()
  dateDebut: Date;

  @Prop()
  dateFin: Date;

  @Prop()
  commentaire: string;

  @Prop()
  dateDemande: Date;


  @Prop({ default: 'pending' })
  statut: string;

  @Prop()
  attestation: string; 
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employe' })
  employe: string;
}


export type CongeDocument = HydratedDocument<Conge>;
export const CongeSchema = SchemaFactory.createForClass(Conge);
