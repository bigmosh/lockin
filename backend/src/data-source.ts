import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USER || 'lockin',
  password: process.env.DATABASE_PASSWORD || 'lockin_password',
  database: process.env.DATABASE_NAME || 'lockin_db',
  entities: [User, Room, RoomMember],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
