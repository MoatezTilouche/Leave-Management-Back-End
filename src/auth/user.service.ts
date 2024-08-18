import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employe, EmployeDocument } from './schemas/employe_schema';
import { User, UserDocument } from './schemas/user_schema';
import { Administrateur, AdministrateurDocument } from './schemas/administrateur_schema';
import { UpdateEmployeDto } from './dto/update-employe.dto';
import { MailService } from './mail/mail.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(
    private mailService: MailService, 

    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Employe.name) private readonly employeModel: Model<EmployeDocument>,
    @InjectModel(Administrateur.name) private readonly administrateurModel: Model<AdministrateurDocument>,
  ) {}

  async create(createUserDto: any): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async createEmploye(employeData: any): Promise<Employe> {
    const createdEmploye = new this.employeModel(employeData);
    return await createdEmploye.save();
  }

  async updateEmploye(id: string, updateEmployeDto: UpdateEmployeDto): Promise<Employe> {
    const updatedEmploye = await this.employeModel.findByIdAndUpdate(id, updateEmployeDto, { new: true }).exec();
    if (!updatedEmploye) {
      throw new NotFoundException(`Employe with ID ${id} not found`);
    }
    return updatedEmploye;
  }
  async createAdmin(adminData: any): Promise<Administrateur> {
    const createdAdmin = new this.administrateurModel(adminData);
    return await createdAdmin.save();
  }


async findByEmail(email: string): Promise<User | Employe | Administrateur | undefined> {
  const models: Model<any>[] = [this.userModel, this.employeModel, this.administrateurModel];
  
  for (const model of models) {
    const user = await model.findOne({ email }).exec();
    if (user) {
      return user;
    }
  }

  return undefined;
}

async findById(id: string): Promise<User | Employe | Administrateur | undefined> {
  const models: Model<any>[] = [this.userModel, this.employeModel, this.administrateurModel];
  
  for (const model of models) {
    const user = await (model as Model<any>).findById(id).exec();
    if (user) {
      return user;
    }
  }

  return undefined;
}

async requestPasswordReset(email: string): Promise<void> {
  const user = await this.administrateurModel.findOne({ email }).exec();
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Generate a reset token and expiration date
  const resetToken = crypto.randomBytes(6).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiration = new Date(Date.now() + 3600000); // Token valid for 1 hour
  await user.save();

  // Send reset token to user
  await this.mailService.sendTokenPassword(email, resetToken);
}

async resetPassword(resetToken: string, newPassword: string): Promise<void> {
  const user = await this.administrateurModel.findOne({
    resetToken,
    resetTokenExpiration: { $gte: Date.now() },
  }).exec();

  if (!user) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();
}


}
