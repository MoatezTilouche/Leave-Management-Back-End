import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conge, CongeDocument } from 'src/conge/schemas/conge_schema';

@Injectable()
export class StatsService {
    constructor(
        @InjectModel(Conge.name) private readonly congeModel: Model<CongeDocument>,
    ) {}

    async getAverageLeaveDays(): Promise<number> {
        const conges = await this.congeModel.find({}).exec();
        const totalDays = conges.reduce((acc, conge) => {
            const days = (conge.dateFin.getTime() - conge.dateDebut.getTime()) / (1000 * 3600 * 24);
            return acc + days;
        }, 0);

        return conges.length > 0 ? totalDays / conges.length : 0;
    }

    async getMostRequestedPeriods(): Promise<{ period: string, count: number }[]> {
      const conges = await this.congeModel.find({}).exec();
      const periods = conges.map(conge => {
          const startDate = new Date(conge.dateDebut);
          const month = startDate.toLocaleString('en-US', { month: 'long' });
          const year = startDate.getFullYear();
          return `${month} ${year}`;
      });
  
      const periodCounts: { [period: string]: number } = {};
      periods.forEach(period => {
          periodCounts[period] = (periodCounts[period] || 0) + 1;
      });
  
      const periodData = Object.keys(periodCounts).map(period => ({
        period,
        count: periodCounts[period]
      }));
  
      return periodData.sort((a, b) => b.count - a.count);
    }
    async getAcceptedLeavesByMonth(year: number): Promise<number[]> {
        const months = Array.from({ length: 12 }, (_, index) => index + 1); // Array de 1 à 12 pour les mois
        const promises = months.map(month =>
          this.congeModel.countDocuments({
            statut: 'accepted',
            dateDebut: {
              $gte: new Date(`${year}-${month.toString().padStart(2, '0')}-01`),
              $lte: new Date(`${year}-${month.toString().padStart(2, '0')}-31`),
            },
          }).exec()
        );
    
        return Promise.all(promises);
      }
      async getRejectedLeavesByMonth(year: number): Promise<number[]> {
        const months = Array.from({ length: 12 }, (_, index) => index + 1); 
        const promises = months.map(month =>
          this.congeModel.countDocuments({
            statut: 'rejected',
            dateDebut: {
              $gte: new Date(`${year}-${month.toString().padStart(2, '0')}-01`),
              $lte: new Date(`${year}-${month.toString().padStart(2, '0')}-31`),
            },
          }).exec()
        );
    
        return Promise.all(promises);
      }
      async getAcceptedLeavesCurrentMonth(): Promise<number> {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        return this.congeModel.countDocuments({
          statut: 'accepted',
          dateDebut: { $gte: startOfMonth, $lt: endOfMonth },
        });
      }
    
      async getRefusedLeavesCurrentMonth(): Promise<number> {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        return this.congeModel.countDocuments({
          statut: 'rejected',
          dateDebut: { $gte: startOfMonth, $lt: endOfMonth },
        });
      }
    
      async getPendingLeavesCurrentMonth(): Promise<number> {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        return this.congeModel.countDocuments({
          statut: 'pending',
          dateDebut: { $gte: startOfMonth, $lt: endOfMonth },
        }).exec();
      }
}
