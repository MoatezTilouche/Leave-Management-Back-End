import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CongeModule } from './conge/conge.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

import { SharedModule } from './shared/shared.module';
import { StatsService } from './stats/stats.service';
import { StatsController } from './stats/stats.controller';
import { StatsModule } from './stats/stats.module';
import { EmployeController } from './auth/employe.controller';
import { EmployeService } from './auth/employe.service';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminController } from './auth/admin/admin.controller';
import { AdminService } from './auth/admin/admin.service';
import { MailService } from './auth/mail/mail.service';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:'.env',
      isGlobal:true
    }),
    MulterModule.register({
      dest: './uploads', 
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    CongeModule,
    AuthModule,
    SharedModule,
    StatsModule,
    ScheduleModule.forRoot(),
    NotificationModule,


  ],
  controllers: [AppController, EmployeController, AdminController,],
  providers: [AppService, EmployeService, AdminService, MailService,   ],
})
export class AppModule {}
