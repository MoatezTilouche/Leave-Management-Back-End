import { Controller, Get, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserNotification } from './schemas/notification_schema';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('employe/:employeId')
  async getNotificationsForEmployee(@Param('employeId') employeId: string): Promise<UserNotification[]> {
    return this.notificationService.getNotificationsForEmployee(employeId);
  }

  @Get('admin/:adminId')
  async getNotificationsForAdmin(@Param('adminId') adminId: string): Promise<UserNotification[]> {
    return this.notificationService.getNotificationsForAdmin(adminId);
  }
  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId') notificationId: string): Promise<void> {
    return this.notificationService.deleteNotification(notificationId);
  }
}
