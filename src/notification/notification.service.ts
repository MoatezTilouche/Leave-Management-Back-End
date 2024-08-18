import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserNotification, UserNotificationDocument } from './schemas/notification_schema';
import { Employe, EmployeDocument } from 'src/auth/schemas/employe_schema';
import { CreateNotificationnDto } from './dto/create_notification.dto';
import { Administrateur, AdministrateurDocument } from 'src/auth/schemas/administrateur_schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(UserNotification.name) private notificationModel: Model<UserNotificationDocument>,
    @InjectModel(Employe.name) private employeModel: Model<EmployeDocument>,
    @InjectModel(Administrateur.name) private adminModel: Model<AdministrateurDocument>,

  ) {}

  async createNotificationForEmploye(createNotificationDto: CreateNotificationnDto): Promise<UserNotification> {
    const employe = await this.employeModel.findById(createNotificationDto.employe).exec();
    if (!employe) {
      throw new NotFoundException(`Employe with id ${createNotificationDto.employe} not found`);
    }

    const newNotification = new this.notificationModel({
      ...createNotificationDto,
      employe: employe._id,
    });

    const savedNotification: UserNotification = await newNotification.save();


    await employe.save();

    return savedNotification;
  }
  async createNotificationForAdmin(createNotificationDto: CreateNotificationnDto): Promise<UserNotification> {
    const admin = await this.adminModel.findById(createNotificationDto.admin).exec();
    if (!admin) {
      throw new NotFoundException(`Admin with id ${createNotificationDto.admin} not found`);
    }

    const newNotification = new this.notificationModel({
      ...createNotificationDto,
      admin: admin._id,
    });

    const savedNotification: UserNotification = await newNotification.save();


    await admin.save();

    return savedNotification;
  }
  async getNotificationsForEmployee(employeId: string): Promise<UserNotification[]> {
    const notifications =await this.notificationModel.find({ employe: employeId }).exec();
    for (const notification of notifications) {
      const admin = await this.adminModel.findById(notification.admin).exec();
      if (admin) {
        (notification as any).photo = admin.photo;
      }
    }
    return notifications;
  }
  async getNotificationsForAdmin(adminId: string): Promise<UserNotification[]> {
    const notifications = await this.notificationModel.find({ admin: adminId }).exec();

    for (const notification of notifications) {
      const employe = await this.employeModel.findById(notification.employe).exec();
      if (employe) {
        (notification as any).photo = employe.photo;
      }
    }

    return notifications;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const result = await this.notificationModel.findByIdAndDelete(notificationId).exec();
    if (!result) {
      throw new NotFoundException(`Notification with id ${notificationId} not found`);
    }
  }
}
