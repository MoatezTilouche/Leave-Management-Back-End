import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true
})
export class UserNotification extends Document {
  @Prop({ required: true })
  nameNotif: string;

  @Prop({ required: true })
  dateNotif: Date;

  @Prop({ required: true })
  contenuNotif: string;

 

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employe' })
 employe: MongooseSchema.Types.ObjectId;

 @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Administrateur' })
 admin: MongooseSchema.Types.ObjectId;

}


export type UserNotificationDocument = UserNotification & Document;
export const NotificationSchema = SchemaFactory.createForClass(UserNotification);
