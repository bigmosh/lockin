import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../entities/room.entity';
import { RoomMember } from '../entities/room-member.entity';
import { User } from '../entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ScheduleService } from '../schedule/schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomMember, User])],
  providers: [DashboardService, ScheduleService],
  controllers: [DashboardController],
})
export class DashboardModule {}