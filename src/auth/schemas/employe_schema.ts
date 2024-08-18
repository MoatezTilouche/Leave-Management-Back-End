import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Conge } from 'src/conge/schemas/conge_schema';
import { User } from './user_schema';
import { UserNotification } from 'src/notification/schemas/notification_schema';


@Schema()
export class Employe extends User {
  @Prop()
  department: string;

  @Prop({ default: 0 })
  soldeConges: number;

  @Prop({ default: 5})
  soldeMaladie: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Conge' }] })
  conges: Conge[];


  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'UserNotification' }] })
  empnotifications: UserNotification[];  
  

}

export type EmployeDocument = Employe & Document;
export const EmployeSchema = SchemaFactory.createForClass(Employe);

EmployeSchema.set('discriminatorKey', 'role');
