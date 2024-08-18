import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employe, EmployeSchema } from '../auth/schemas/employe_schema';
import { Conge, CongeSchema } from '../conge/schemas/conge_schema';
import { User, UserSchema } from 'src/auth/schemas/user_schema';
import { Administrateur, AdministrateurSchema } from 'src/auth/schemas/administrateur_schema';
import { NotificationSchema, UserNotification } from 'src/notification/schemas/notification_schema';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employe.name, schema: EmployeSchema },
      { name: Conge.name, schema: CongeSchema },
      { name: User.name, schema: UserSchema },
      {name:Administrateur.name,schema:AdministrateurSchema},
      {name:UserNotification.name,schema:NotificationSchema},
 

      
    ]),
    
  ],
  exports: [MongooseModule],
})
export class SharedModule {}
