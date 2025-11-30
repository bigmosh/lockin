import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RecurrenceType } from '../entities/room.entity';
import { User } from '../entities/user.entity';
import { RoomMember } from '../entities/room-member.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomsRepo: Repository<Room>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(RoomMember) private readonly membersRepo: Repository<RoomMember>,
    private readonly scheduleService: ScheduleService,
  ) {}

  async createRoom(authUser: { id: number }, dto: CreateRoomDto) {
    if (dto.recurrence_type === RecurrenceType.WEEKLY && (!dto.recurrence_days || dto.recurrence_days.length === 0)) {
      throw new BadRequestException('recurrence_days are required for weekly recurrence');
    }
    if (dto.recurrence_type === RecurrenceType.MONTHLY) {
      const days = dto.recurrence_days || [];
      if (days.length === 0) throw new BadRequestException('recurrence_days are required for monthly recurrence');
      if (!days.every((d) => Number.isInteger(d) && d >= 1 && d <= 31)) {
        throw new BadRequestException('monthly recurrence_days must be integers between 1 and 31');
      }
    }
    const creator = await this.usersRepo.findOne({ where: { id: authUser.id } });
    if (!creator) throw new ForbiddenException('Invalid user');

    const room = this.roomsRepo.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      creator,
      meetLink: dto.meet_link,
      recurrenceType: dto.recurrence_type,
      recurrenceDays: dto.recurrence_days,
      timeOfDay: dto.time_of_day,
      startDate: dto.start_date,
      endDate: dto.end_date,
      imageUrl: dto.image_url || 'https://placehold.co/600x400?text=Room',
    });
    const saved = await this.roomsRepo.save(room);
    return saved;
  }

  async listPublicRooms() {
    const rooms = await this.roomsRepo.find({ relations: ['creator'] });
    return rooms
      .map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        category: room.category,
        creator: { id: room.creator.id, name: room.creator.name },
        image_url: room.imageUrl,
        next_meeting: this.scheduleService.computeNextMeeting(room),
      }))
      .sort((a, b) => {
        const at = a.next_meeting ? (a.next_meeting as Date).getTime() : Number.MAX_SAFE_INTEGER;
        const bt = b.next_meeting ? (b.next_meeting as Date).getTime() : Number.MAX_SAFE_INTEGER;
        return at - bt;
      });
  }

  async getRoomDetails(id: number, authUser?: { id: number }) {
    const room = await this.roomsRepo.findOne({ where: { id }, relations: ['creator'] });
    if (!room) throw new NotFoundException('Room not found');
    const next = this.scheduleService.computeNextMeeting(room);
    let is_member = false;
    let is_creator = false;
    if (authUser?.id) {
      is_creator = authUser.id === room.creator.id;
      const membership = await this.membersRepo.findOne({ where: { user: { id: authUser.id }, room: { id: room.id } }, relations: ['user', 'room'] });
      is_member = !!membership;
    }
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      category: room.category,
      creator: { id: room.creator.id, name: room.creator.name },
      meet_link: room.meetLink,
      recurrence_type: room.recurrenceType,
      recurrence_days: room.recurrenceDays || [],
      time_of_day: room.timeOfDay,
      start_date: room.startDate,
      end_date: room.endDate,
      image_url: room.imageUrl,
      next_meeting: next,
      is_member,
      is_creator,
    };
  }

  async updateRoom(id: number, authUser: { id: number }, dto: UpdateRoomDto) {
    const room = await this.roomsRepo.findOne({ where: { id }, relations: ['creator'] });
    if (!room) throw new NotFoundException('Room not found');
    
    // Verify requesting user is the room creator
    if (room.creator.id !== authUser.id) {
      throw new ForbiddenException('Only the room creator can update this room');
    }

    // Validate weekly recurrence if being updated
    if (dto.recurrence_type === RecurrenceType.WEEKLY || 
        (room.recurrenceType === RecurrenceType.WEEKLY && dto.recurrence_type === undefined)) {
      const recurrenceDays = dto.recurrence_days !== undefined ? dto.recurrence_days : room.recurrenceDays;
      if (!recurrenceDays || recurrenceDays.length === 0) {
        throw new BadRequestException('recurrence_days are required for weekly recurrence');
      }
    }

    if (dto.recurrence_type === RecurrenceType.MONTHLY || 
        (room.recurrenceType === RecurrenceType.MONTHLY && dto.recurrence_type === undefined)) {
      const recurrenceDays = dto.recurrence_days !== undefined ? dto.recurrence_days : room.recurrenceDays;
      if (!recurrrenceDaysValidMonthly(recurrenceDays)) {
        throw new BadRequestException('monthly recurrence_days must be integers between 1 and 31');
      }
    }

    // Update fields
    if (dto.name !== undefined) room.name = dto.name;
    if (dto.description !== undefined) room.description = dto.description;
    if (dto.category !== undefined) room.category = dto.category;
    if (dto.meet_link !== undefined) room.meetLink = dto.meet_link;
    if (dto.recurrence_type !== undefined) room.recurrenceType = dto.recurrence_type;
    if (dto.recurrence_days !== undefined) room.recurrenceDays = dto.recurrence_days;
    if (dto.time_of_day !== undefined) room.timeOfDay = dto.time_of_day;
    if (dto.start_date !== undefined) room.startDate = dto.start_date;
    if (dto.end_date !== undefined) room.endDate = dto.end_date;
    if (dto.image_url !== undefined) room.imageUrl = dto.image_url;

    const updated = await this.roomsRepo.save(room);
    return updated;
  }

  async purgeAllRooms() {
    // Remove memberships first due to FK constraints, then rooms
    await this.membersRepo.createQueryBuilder().delete().where('1=1').execute();
    await this.roomsRepo.createQueryBuilder().delete().where('1=1').execute();
    return { message: 'All rooms purged' };
  }

  async deleteRoom(id: number, authUser: { id: number }) {
    const room = await this.roomsRepo.findOne({ where: { id }, relations: ['creator'] });
    if (!room) throw new NotFoundException('Room not found');
    
    // Verify requesting user is the room creator
    if (room.creator.id !== authUser.id) {
      throw new ForbiddenException('Only the room creator can delete this room');
    }

    await this.roomsRepo.remove(room);
    return { message: 'Room deleted successfully' };
  }
}

function recurrrenceDaysValidMonthly(days?: number[]): boolean {
  if (!days || days.length === 0) return false;
  return days.every((d) => Number.isInteger(d) && d >= 1 && d <= 31);
}
