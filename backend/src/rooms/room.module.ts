import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../entities/room.entity';
import { User } from '../entities/user.entity';
import { RoomMember } from '../entities/room-member.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User, RoomMember]), ScheduleModule],
  providers: [RoomService],
  controllers: [RoomController],
})
export class RoomModule {}