import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Req, Param, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req: any, @Body() dto: CreateRoomDto) {
    return this.roomService.createRoom(req.user, dto);
  }

  @Get('public')
  async listPublic() {
    return this.roomService.listPublicRooms();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async details(@Req() req: any, @Param('id') id: string) {
    return this.roomService.getRoomDetails(Number(id), req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomService.updateRoom(Number(id), req.user, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.roomService.deleteRoom(Number(id), req.user);
  }

  // Admin-style purge endpoint; consider protecting this further in production
  @Delete('purge/all')
  @UseGuards(AuthGuard('jwt'))
  async purge(@Req() req: any) {
    // In a real app, check req.user.role === 'admin'
    return this.roomService.purgeAllRooms();
  }
}