
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conge, CongeDocument } from './schemas/conge_schema';
import { CreateCongeDto } from './dto/create-conges-dto';
import { Employe, EmployeDocument } from '../auth/schemas/employe_schema';
import { UpdateCongeDto } from './dto/update-conge-dto';
import moment from 'moment'; 
import { Cron, CronExpression } from '@nestjs/schedule';
import * as admin from 'firebase-admin';
import { NotificationService } from 'src/notification/notification.service';
import { Administrateur, AdministrateurDocument } from 'src/auth/schemas/administrateur_schema';

@Injectable()
export class CongeService {
  constructor(
    @InjectModel(Conge.name) private congeModel: Model<CongeDocument>,
    @InjectModel(Employe.name) private readonly employeModel: Model<EmployeDocument>,
    @InjectModel(Administrateur.name) private readonly adminModel: Model<AdministrateurDocument>,

    private readonly notificationService: NotificationService, // Inject NotificationService

  ) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // Update this to use your Firebase credentials
    });
  }


  private async sendNotification(token: string, title: string, body: string) {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    try {
      await admin.messaging().send(message);
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }




  async findAll(): Promise<Conge[]> {
    return this.congeModel.find().exec();
  }

  async createDemandeConge(email: string, demandeCongeDto: CreateCongeDto): Promise<any> {
    try {
        const { dateDebut, dateFin } = demandeCongeDto;
        const employe = await this.employeModel.findOne({ email }).exec();
        if (!employe) {
            throw new NotFoundException(`Employe with email ${email} not found`);
        }

        if (moment(dateDebut).isBefore(dateFin)) {
            console.log("Creating new leave request...");

            const newConge = new this.congeModel({
                ...demandeCongeDto,
                employe: employe._id,
            });

            const savedConge = await newConge.save();

            if (!employe.conges) {
                employe.conges = [];
            }
            employe.conges.push(savedConge);
            await employe.save();

           
            const admins = await this.adminModel.find().exec();
            if (admins.length > 0) {
                
                for (const admin of admins) {
                    await this.notificationService.createNotificationForAdmin({
                      nameNotif: 'New Leave Request',
                      dateNotif: new Date(),
                      contenuNotif: `A new leave request has been submitted by ${employe.name} from ${moment(savedConge.dateDebut).format('DD/MM/YYYY')} to ${moment(savedConge.dateFin).format('DD/MM/YYYY')}.`,
                      admin: admin._id as string,
                      employe: null as unknown as string,  // No admin involved in this notification
                    });

                
                }
            }

            return savedConge;
        } else {
            throw new BadRequestException('The start date should be before the end date.');
        }
    } catch (error) {
        console.error('Error in createDemandeConge:', error);
        throw error;
    }
}

  

  async findById(id: string): Promise<Conge> {
    const conge = await this.congeModel.findById(id).exec();
    if (!conge) {
      throw new NotFoundException('Conge Not Found');
    }

    return conge;
  }
  async findAcceptedConges(): Promise<{ conge: Conge, employeName: string }[]> {
    const acceptedConges = await this.congeModel.find({ statut: 'accepted' })
      .populate('employe', 'name') 
      .exec();
  
    if (acceptedConges.length === 0) {
      console.log("No accepted conges found");
    }
else{
  console.log(" accepted conges found");

}
    return acceptedConges.map(conge => ({
      conge,
      employeName: conge.employe || 'Unknown' 
    }));
  }
  
  async findAllWithNames(): Promise<{ conge: Conge, employeName: string }[]> {
    const conges = await this.congeModel.find().populate('employe','name').exec();
    

    if (conges.length === 0) {
      console.log("No conges found");
    }

    return conges.map(conge => ({
      conge,
      employeName: conge.employe || 'Unknown' 
    }));
  }
  
  async findPendingConges(): Promise<{ conge: Conge, employeName: string }[]> {
    const pendingConges = await this.congeModel.find({ statut: 'pending' })
      .populate('employe', 'name') 
      .exec();
  
    if (pendingConges.length === 0) {
      console.log("No pending conges found");
    }
else{
  console.log(" pending conges found");

}
    return pendingConges.map(conge => ({
      conge,
      employeName: conge.employe || 'Unknown' 
    }));
  }

  async updateById(id: string, conge: UpdateCongeDto): Promise<Conge> {
    return this.congeModel.findByIdAndUpdate(id, conge, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<Conge> {
    return this.congeModel.findByIdAndDelete(id).exec();
  }

  async acceptConge(id: string): Promise<Conge> {
    const conge = await this.congeModel.findById(id).exec();
    if (!conge) {
      throw new NotFoundException('Conge not found');
    }
  
    const employe = await this.employeModel.findById(conge.employe).exec();
    if (!employe) {
      throw new NotFoundException('Employe not found');
    }
  
    const startDate = moment(conge.dateDebut);
    const endDate = moment(conge.dateFin);
    const leaveDays = endDate.diff(startDate, 'days') + 1;
  
    if (conge.typeConge === 'Maladie') {
      employe.soldeMaladie -= leaveDays;
    } else {
      employe.soldeConges -= leaveDays;
    }
  
    if (employe.soldeConges < 0 || employe.soldeMaladie < 0) {
      throw new BadRequestException('Not enough leave balance');
    }
  
    await employe.save();
  
    conge.statut = 'accepted';
    const savedConge = await conge.save();
  
    await this.notificationService.createNotificationForEmploye({
      nameNotif: 'Leave Request Accepted',
      dateNotif: new Date(),
      contenuNotif: `Your leave request from ${moment(conge.dateDebut).format('DD/MM/YYYY')} to ${moment(conge.dateFin).format('DD/MM/YYYY')} has been accepted.`,
      employe: employe._id as string,
      admin: null as unknown as string,  // No admin involved in this notification
    });
  
    const admins = await this.adminModel.find().exec();
    for (const admin of admins) {
      await this.notificationService.createNotificationForAdmin({
        nameNotif: 'Leave Request Accepted',
        dateNotif: new Date(),
        contenuNotif: `${employe.name}'s leave request from ${moment(conge.dateDebut).format('DD/MM/YYYY')} to ${moment(conge.dateFin).format('DD/MM/YYYY')} has been accepted.`,
        admin: admin._id as string,
        employe: null as unknown as string,
      });
    }
  
    return savedConge;
  }
  


  async rejectConge(id: string): Promise<Conge> {
    const conge = await this.congeModel.findById(id).exec();
    if (!conge) {
      throw new NotFoundException('Conge not found');
    }
  
    const employe = await this.employeModel.findById(conge.employe).exec();
    if (!employe) {
      throw new NotFoundException('Employe not found');
    }
  
    conge.statut = 'rejected';
    const savedConge = await conge.save();


    const admins = await this.adminModel.find().exec();
   
    await this.notificationService.createNotificationForEmploye({
      nameNotif: 'Leave Request Rejected',
      dateNotif: new Date(),
      contenuNotif: `Your leave request from ${moment(conge.dateDebut).format('DD/MM/YYYY')} to ${moment(conge.dateFin).format('DD/MM/YYYY')} has been rejected.`,
      employe: employe._id as string,
      admin: null as unknown as string
    });
  

    for (const admin of admins) {
      await this.notificationService.createNotificationForAdmin({
        nameNotif: 'Leave Request Rejected',
        dateNotif: new Date(),
        contenuNotif: `${employe.name}'s leave request from ${moment(conge.dateDebut).format('DD/MM/YYYY')} to ${moment(conge.dateFin).format('DD/MM/YYYY')} has been rejected.`,
        admin: admin._id as string,
        employe: null as unknown as string,
      });
    }
  
    return savedConge;
  }
  
  
  async updateAttestation(id:string,attUrl:string): Promise<Conge>{
     const updatedConge=await this.congeModel.findByIdAndUpdate(
      id,
      { attestation :attUrl } ,
      { new :true }
     ).exec();
     return updatedConge;
  }





                   /***Stats***********/
  async getLeaveTypePercentages(): Promise<{ type: string, percentage: number }[]> {
    const leaves = await this.congeModel.find().exec(); // Fetch all leaves
    const totalLeaves = leaves.length;

    const typeCounts = this.calculateTypeCounts(leaves);

    
    const percentages = typeCounts.map(typeCount => ({
      type: typeCount.type,
      percentage: (typeCount.count / totalLeaves) * 100,
    }));

    return percentages;
  }

  private calculateTypeCounts(leaves: Conge[]): { type: string, count: number }[] {
    const typeCounts: { [key: string]: number } = {};

    leaves.forEach(leave => {
      const type = leave.typeConge;
      if (typeCounts[type]) {
        typeCounts[type]++;
      } else {
        typeCounts[type] = 1;
      }
    });

    return Object.keys(typeCounts).map(type => ({
      type,
      count: typeCounts[type],
    }));
  }
  async countCongesByStatusForEmploye(employeId: string, status: string): Promise<number> {
    return this.congeModel.countDocuments({ employe: employeId, statut: status }).exec();
  }

  async countAcceptedCongesForEmploye(employeId: string): Promise<number> {
    return this.countCongesByStatusForEmploye(employeId, 'accepted');
  }

  async countPendingCongesForEmploye(employeId: string): Promise<number> {
    return this.countCongesByStatusForEmploye(employeId, 'pending');
  }

  async countRejectedCongesForEmploye(employeId: string): Promise<number> {
    return this.countCongesByStatusForEmploye(employeId, 'rejected');
  }
  


  async calculateTotalDaysTakenThisYear(employeId: string): Promise<number> {
    const startOfYear = moment().startOf('year').toDate();
    const endOfYear = moment().endOf('year').toDate();

    const conges = await this.congeModel.find({
      employe: employeId,
      statut: 'accepted',
      dateDebut: { $gte: startOfYear, $lte: endOfYear }
    }).exec();

    let totalDays = 0;

    conges.forEach(conge => {
      const startDate = moment(conge.dateDebut);
      const endDate = moment(conge.dateFin);
      const duration = endDate.diff(startDate, 'days') + 1; 
      totalDays += duration;
    });

    return totalDays;
  }



  @Cron('0 0 1 * *') // Runs at midnight on the first day of every month
  async incrementLeaveBalance() {
    const employees = await this.employeModel.find().exec();
    for (const employee of employees) {
      employee.soldeConges += 1.75;
      await employee.save();
    }
    console.log('Leave balance updated for all employees');
  }
}
