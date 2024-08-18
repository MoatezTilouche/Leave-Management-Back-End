import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],  // <- Make sure to export the service

})
export class NotificationModule {}
