import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CongeController } from './conge.controller';
import { CongeService } from './conge.service';
import { Conge, CongeSchema } from './schemas/conge_schema';
import { Employe, EmployeSchema } from '../auth/schemas/employe_schema';
import { SharedModule } from 'src/shared/shared.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [SharedModule,
    NotificationModule, 
  ],
  controllers: [CongeController],
  providers: [CongeService],
})
export class CongeModule {}
