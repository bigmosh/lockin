import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { RoomMember } from '../entities/room-member.entity';
import { User } from '../entities/user.entity';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Room) private readonly roomsRepo: Repository<Room>,
    @InjectRepository(RoomMember) private readonly membersRepo: Repository<RoomMember>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly scheduleService: ScheduleService,
  ) {}

  async getDashboard(authUser: { id: number }) {
    const user = await this.usersRepo.findOne({ where: { id: authUser.id } });
    if (!user) return [];

    const createdRooms = await this.roomsRepo.find({ where: { creator: { id: user.id } }, relations: ['creator'] });
    const memberships = await this.membersRepo.find({ where: { user: { id: user.id } }, relations: ['room', 'room.creator'] });
    const memberRooms = memberships.map((m) => m.room);

    const roomById = new Map<number, Room>();
    for (const r of [...createdRooms, ...memberRooms]) roomById.set(r.id, r);

    const items = Array.from(roomById.values()).map((room) => {
      const next = this.scheduleService.computeNextMeeting(room);
      return {
        room_id: room.id,
        name: room.name,
        category: room.category,
        creator: { id: room.creator.id, name: room.creator.name },
        meet_link: room.meetLink,
        time_of_day: room.timeOfDay,
        next_meeting: next,
      };
    });

    return items
      .filter((it) => !!it.next_meeting)
      .sort((a, b) => (a.next_meeting as Date).getTime() - (b.next_meeting as Date).getTime());
  }

  async getUpcomingEvents(authUser: { id: number }, days = 30) {
    const user = await this.usersRepo.findOne({ where: { id: authUser.id } });
    if (!user) return [];

    const createdRooms = await this.roomsRepo.find({ where: { creator: { id: user.id } }, relations: ['creator'] });
    const memberships = await this.membersRepo.find({ where: { user: { id: user.id } }, relations: ['room', 'room.creator'] });
    const memberRooms = memberships.map((m) => m.room);

    const roomById = new Map<number, Room>();
    for (const r of [...createdRooms, ...memberRooms]) roomById.set(r.id, r);

    const rooms = Array.from(roomById.values());
    return this.scheduleService.generateUpcomingEvents(rooms, days);
  }
}