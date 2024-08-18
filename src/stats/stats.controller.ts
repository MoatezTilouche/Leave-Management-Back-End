import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get('average-leave-days')
    async getAverageLeaveDays(): Promise<{count:number}> {
        const count= await this.statsService.getAverageLeaveDays();
        return { count};
      }

   
  @Get('most-requested-periods')
  async getMostRequestedPeriods() {
    return this.statsService.getMostRequestedPeriods();
  }
    @Get('/accepted-leaves-by-month/:year')
    async getAcceptedLeavesByMonth(
      @Param('year', ParseIntPipe) year: number,
    ): Promise<number[]> {
      return this.statsService.getAcceptedLeavesByMonth(year);
    }

    @Get('/refused-leaves-by-month/:year')
    async getRefusedLeavesByMonth(
      @Param('year', ParseIntPipe) year: number,
    ): Promise<number[]> {
      return this.statsService.getRejectedLeavesByMonth(year);
    }



    @Get('/accepted-leaves-current-month')
  async getAcceptedLeavesCurrentMonth(): Promise<number> {
    return this.statsService.getAcceptedLeavesCurrentMonth();
  }


  @Get('/refused-leaves-current-month')
  async getRefusedLeavesCurrentMonth(): Promise<number> {
    return this.statsService.getRefusedLeavesCurrentMonth();
  }

  @Get('/pending-leaves-current-month')
  async getPendingLeavesCurrentMonth(): Promise<{count : number} > {
     const count = await this.statsService.getPendingLeavesCurrentMonth();
     return { count };
    }

}
