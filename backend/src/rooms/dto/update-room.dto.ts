import { IsArray, IsEnum, IsOptional, IsString, Matches, IsDateString, IsUrl } from 'class-validator';
import { RoomCategory, RecurrenceType } from '../../entities/room.entity';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RoomCategory)
  @IsOptional()
  category?: RoomCategory;

  @IsString()
  @IsOptional()
  meet_link?: string;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence_type?: RecurrenceType;

  @IsArray()
  @IsOptional()
  recurrence_days?: number[];

  @Matches(/^\d{2}:\d{2}$/)
  @IsOptional()
  time_of_day?: string; // HH:mm

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
