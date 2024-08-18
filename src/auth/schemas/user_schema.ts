import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserNotification } from 'src/notification/schemas/notification_schema';

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: string;

  @Prop()
  dateInscription: Date;

  @Prop()
  photo: string;

  @Prop()
  age:number
  
  @Prop()
  sexe:string

  @Prop()
  fcmToken: string; 

  @Prop()
  resetToken: string;

  @Prop({ required: false })
  resetTokenExpiration: Date;

  
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
