import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Administrateur, AdministrateurDocument } from '../schemas/administrateur_schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateAdminDto } from '../dto/update_admin.dto';
import { Employe, EmployeDocument } from '../schemas/employe_schema';
import { ChangePasswordDto } from '../dto/change_password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    @InjectModel(Administrateur.name) private adminModel: Model<AdministrateurDocument>;
    @InjectModel(Employe.name) private employeModel: Model<EmployeDocument>;

   

    
    
    async findAll(): Promise<Administrateur[]> {
        return this.adminModel.find().exec();
    }

    async updateById(id: string, admin: UpdateAdminDto): Promise<Administrateur> {
        return this.adminModel.findByIdAndUpdate(id, admin, {
            new: true,
            runValidators: true,
        }).exec();
    }
    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const admin = await this.adminModel.findById(id).exec();
        if (!admin) {
            throw new NotFoundException(`Admin with id ${id} not found`);
        }
    
   
    
        const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, admin.password);
        if (!isMatch) {
            throw new BadRequestException('Current password is incorrect');
        }
    
        admin.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await admin.save();
    }
    
    

    async updatePhoto(id: string, photoUrl: string): Promise<Administrateur> {
        const updatedAdmin = await this.adminModel.findByIdAndUpdate(
            id,
            { photo: photoUrl },
            { new: true }
        ).exec();
        return updatedAdmin;
    }
    async findAdminById(AdminId: string): Promise<Administrateur> {
        const admin = await this.adminModel.findById(AdminId).exec();
        if (!admin) {
            throw new NotFoundException(`Admin with id ${AdminId} not found`);
        }
        return admin;
    }
    async deleteById(id: string): Promise<Administrateur> {
        return this.adminModel.findByIdAndDelete(id).exec();
      }  

    //   async getAdminCount(): Promise<number> {
    //     return this.adminModel.countDocuments().exec();
    //   }



      async countEmployeesInSameDepartment(adminId: string): Promise<number> {
        const admin = await this.findAdminById(adminId);
        if (!admin) {
            throw new NotFoundException(`Admin with id ${adminId} not found`);
        }
        const department = admin.department;
        return this.employeModel.countDocuments({ department }).exec();
    }
 


}
