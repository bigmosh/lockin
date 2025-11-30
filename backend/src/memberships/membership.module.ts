import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomMember } from '../entities/room-member.entity';
import { Room } from '../entities/room.entity';
import { User } from '../entities/user.entity';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoomMember, Room, User])],
  providers: [MembershipService],
  controllers: [MembershipController],
})
export class MembershipModule {}