import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, Index } from 'typeorm';
import { User } from './user.entity';
import { Room } from './room.entity';

@Entity({ name: 'room_members' })
@Unique('uq_user_room', ['user', 'room'])
export class RoomMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @Index('idx_user_id')
  user: User;

  @ManyToOne(() => Room, (room) => room.members, { onDelete: 'CASCADE' })
  @Index('idx_room_id')
  room: Room;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}