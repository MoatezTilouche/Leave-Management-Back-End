import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employe, EmployeDocument } from './schemas/employe_schema';
import { UpdateEmployeDto } from './dto/update-employe.dto';
import { Conge, CongeDocument } from 'src/conge/schemas/conge_schema';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change_password.dto';

@Injectable()
export class EmployeService {
    @InjectModel(Employe.name) private employeModel: Model<EmployeDocument>;
    @InjectModel(Conge.name) private readonly congeModel: Model<CongeDocument>;


    async findAll(): Promise<Employe[]> {
        return this.employeModel.find().exec();
    }

    async updateById(id: string, employe: UpdateEmployeDto): Promise<Employe> {
        return this.employeModel.findByIdAndUpdate(id, employe, {
            new: true,
            runValidators: true,
        }).exec();
    }

    async findEmployeConges(employeId: string): Promise<Conge[]> {
        const employe = await this.employeModel.findById(employeId).exec();
        if (!employe) {
            throw new NotFoundException(`Employe with id ${employeId} not found`);
        }
       
        return this.congeModel.find({ employe: employeId }).exec();
    }

    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const employe = await this.employeModel.findById(id).exec();
        if (!employe) {
            throw new NotFoundException(`Employe with id ${id} not found`);
        }

        const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, employe.password);
        if (!isMatch) {
            throw new BadRequestException('Current password is incorrect');
        }

        employe.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await employe.save();
    }

    async updatePhoto(id: string, photoUrl: string): Promise<Employe> {
        const updatedEmploye = await this.employeModel.findByIdAndUpdate(
            id,
            { photo: photoUrl },
            { new: true }
        ).exec();
        return updatedEmploye;
    }
    async findEmployeById(employeId: string): Promise<Employe> {
        const employe = await this.employeModel.findById(employeId).exec();
        if (!employe) {
            throw new NotFoundException(`Employe with id ${employeId} not found`);
        }
        return employe;
    }

    async getEmployeCount(): Promise<number> {
        return this.employeModel.countDocuments().exec();
      }

      async deleteById(id: string): Promise<Employe> {
        return this.employeModel.findByIdAndDelete(id).exec();
      }  
}
