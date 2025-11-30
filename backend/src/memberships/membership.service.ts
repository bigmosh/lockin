import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomMember } from '../entities/room-member.entity';
import { Room } from '../entities/room.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(RoomMember) private readonly membersRepo: Repository<RoomMember>,
    @InjectRepository(Room) private readonly roomsRepo: Repository<Room>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async joinRoom(authUser: { id: number }, roomId: number) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    const user = await this.usersRepo.findOne({ where: { id: authUser.id } });
    if (!user) throw new NotFoundException('User not found');

    let membership = await this.membersRepo.findOne({ where: { user: { id: user.id }, room: { id: room.id } }, relations: ['user', 'room'] });
    if (!membership) {
      membership = this.membersRepo.create({ user, room });
      membership = await this.membersRepo.save(membership);
    }
    return membership;
  }

  async getMyRooms(authUser: { id: number }) {
    const createdRooms = await this.roomsRepo.find({ where: { creator: { id: authUser.id } }, relations: ['creator'] });
    const memberships = await this.membersRepo.find({ where: { user: { id: authUser.id } }, relations: ['room', 'room.creator'] });
    const memberRooms = memberships.map((m) => m.room);

    // Merge rooms avoiding duplicates
    const byId = new Map<number, Room>();
    for (const r of [...createdRooms, ...memberRooms]) {
      byId.set(r.id, r);
    }
    return Array.from(byId.values());
  }

  async listMembers(authUser: { id: number }, roomId: number) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId }, relations: ['creator'] });
    if (!room) throw new NotFoundException('Room not found');

    // Allow creator or members to view
    const isCreator = room.creator.id === authUser.id;
    let isMember = false;
    if (!isCreator) {
      const membership = await this.membersRepo.findOne({ where: { user: { id: authUser.id }, room: { id: roomId } } });
      isMember = !!membership;
    }
    if (!isCreator && !isMember) throw new ForbiddenException('Not allowed to view members');

    const members = await this.membersRepo.find({ where: { room: { id: roomId } }, relations: ['user'] });
    return members.map((m) => ({ id: m.user.id, name: m.user.name }));
  }

  async leaveRoom(authUser: { id: number }, roomId: number) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    const membership = await this.membersRepo.findOne({ where: { user: { id: authUser.id }, room: { id: roomId } }, relations: ['user', 'room'] });
    if (!membership) throw new NotFoundException('Membership not found');
    await this.membersRepo.remove(membership);
    return { message: 'Left room successfully' };
  }

  async removeMember(authUser: { id: number }, roomId: number, targetUserId: number) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId }, relations: ['creator'] });
    if (!room) throw new NotFoundException('Room not found');
    if (room.creator.id !== authUser.id) throw new ForbiddenException('Only the room creator can remove members');
    const membership = await this.membersRepo.findOne({ where: { user: { id: targetUserId }, room: { id: roomId } }, relations: ['user', 'room'] });
    if (!membership) throw new NotFoundException('Membership not found');
    await this.membersRepo.remove(membership);
    return { message: 'Member removed successfully' };
  }
}