import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Employe, EmployeDocument } from './schemas/employe_schema';
import { User, UserDocument } from './schemas/user_schema';
import { Administrateur, AdministrateurDocument } from './schemas/administrateur_schema';
import { MailService } from 'src/auth/mail/mail.service';
import { NotificationService } from 'src/notification/notification.service';
import { ForgotPasswordDto } from './dto/forget_password.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService, 

    @InjectModel(User.name) private  userModel: Model<UserDocument>,
    @InjectModel(Employe.name) private  employeModel: Model<EmployeDocument>,
    @InjectModel(Administrateur.name) private readonly administrateurModel: Model<AdministrateurDocument>,
    private readonly notificationService: NotificationService, // Inject NotificationService

  ) {}

  async signup(createUserDto: CreateUserDto): Promise<User | Employe | Administrateur> {
    const { role, email } = createUserDto;

    // Generate a random password
    const newPassword = this.generateRandomPassword();

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let createdUser: User | Employe | Administrateur;

    // Create the user based on their role
    if (role === 'employe') {
        const employeData = { ...createUserDto, password: hashedPassword };
        createdUser = await this.userService.createEmploye(employeData);
    } else if (role === 'admin') {
        const adminData = { ...createUserDto, password: hashedPassword };
        createdUser = await this.userService.createAdmin(adminData);
        console.log("admin created");
    } else {
        const userData = { ...createUserDto, password: hashedPassword };
        createdUser = await this.userService.create(userData);
    }

    // Send the generated password via email
    await this.mailService.sendUserPassword(email, newPassword);

    return createdUser;
}


private generateRandomPassword(): string {
    return crypto.randomBytes(4).toString('hex');
}


  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(user: any): Promise<User | Employe | Administrateur |null> {
    try {
      const profile = await this.userService.findByEmail(user.email);
      if (!profile) {
        console.error('Error: User not found');
        return null;
      }
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('Email not found');
    }
  
    const newPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    if (user instanceof this.userModel) {
      user.password = hashedPassword;
      await user.save();
    } else if (user instanceof this.employeModel) {
      user.password = hashedPassword;
      await user.save();
    } else if (user instanceof this.administrateurModel) {
      user.password = hashedPassword;
      await user.save();
    } else {
      throw new BadRequestException('User type is not recognized');
    }
  
    await this.mailService.sendNewUserPassword(email, newPassword);
  }
  


}
