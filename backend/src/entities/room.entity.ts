import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { RoomMember } from './room-member.entity';

export enum RoomCategory {
  STUDY = 'study',
  BUILD = 'build',
  READ = 'read',
  COWORK = 'cowork',
  FOCUS = 'focus',
  OTHER = 'other',
}

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index('idx_category')
  @Column({ type: 'enum', enum: RoomCategory })
  category: RoomCategory;

  @ManyToOne(() => User, (user) => user.rooms, { onDelete: 'CASCADE' })
  @Index('idx_creator_id')
  creator: User;

  @Column({ name: 'meet_link', type: 'varchar', length: 255 })
  meetLink: string;

  @Column({ name: 'recurrence_type', type: 'enum', enum: RecurrenceType })
  recurrenceType: RecurrenceType;

  // Store weekdays as simple array of numbers [0-6] (0=Sunday)
  @Column({ name: 'recurrence_days', type: 'simple-array', nullable: true })
  recurrenceDays?: number[];

  // HH:mm format
  @Column({ name: 'time_of_day', type: 'varchar', length: 5 })
  timeOfDay: string;

  // Optional date range for when this room's schedule is active
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string; // YYYY-MM-DD

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string; // YYYY-MM-DD

  // Optional image url for display
  @Column({ name: 'image_url', type: 'varchar', length: 512, nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => RoomMember, (member) => member.room)
  members: RoomMember[];
}
