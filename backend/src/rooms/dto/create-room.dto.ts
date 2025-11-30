import { IsArray, IsEnum, IsOptional, IsString, Matches, IsDateString, IsUrl } from 'class-validator';
import { RoomCategory, RecurrenceType } from '../../entities/room.entity';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RoomCategory)
  category: RoomCategory;

  @IsString()
  meet_link: string;

  @IsEnum(RecurrenceType)
  recurrence_type: RecurrenceType;

  @IsArray()
  @IsOptional()
  recurrence_days?: number[];

  @Matches(/^\d{2}:\d{2}$/)
  time_of_day: string; // HH:mm

  @IsDateString()
  @IsOptional()
  start_date?: string; // YYYY-MM-DD

  @IsDateString()
  @IsOptional()
  end_date?: string; // YYYY-MM-DD

  @IsUrl()
  @IsOptional()
  image_url?: string;
}