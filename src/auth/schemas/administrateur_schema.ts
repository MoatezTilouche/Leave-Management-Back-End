
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './user_schema';
import { UserNotification } from 'src/notification/schemas/notification_schema';
import { Document, Schema as MongooseSchema } from 'mongoose';


@Schema()
export class Administrateur extends User {
  @Prop()
  permissions: string;

  @Prop()
  department:string;

  @Prop({ default: false })
  manager:boolean;
  
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'UserNotification' }] })
  adnotifications: UserNotification[];  
  
}

export type AdministrateurDocument = Administrateur & Document;
export const AdministrateurSchema = SchemaFactory.createForClass(Administrateur);
AdministrateurSchema.set('discriminatorKey', 'role');
