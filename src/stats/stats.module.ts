import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [SharedModule],

    controllers: [StatsController],
    providers: [StatsService],
})
export class StatsModule {}
