import { Controller, Post, Param, UseGuards, Req, Get, Delete } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('rooms/:id/join')
  @UseGuards(AuthGuard('jwt'))
  async join(@Req() req: any, @Param('id') id: string) {
    return this.membershipService.joinRoom(req.user, Number(id));
  }

  @Get('me/rooms')
  @UseGuards(AuthGuard('jwt'))
  async myRooms(@Req() req: any) {
    return this.membershipService.getMyRooms(req.user);
  }

  @Get('rooms/:id/members')
  @UseGuards(AuthGuard('jwt'))
  async listMembers(@Req() req: any, @Param('id') id: string) {
    return this.membershipService.listMembers(req.user, Number(id));
  }

  @Post('rooms/:id/leave')
  @UseGuards(AuthGuard('jwt'))
  async leave(@Req() req: any, @Param('id') id: string) {
    return this.membershipService.leaveRoom(req.user, Number(id));
  }

  @Delete('rooms/:id/members/:userId')
  @UseGuards(AuthGuard('jwt'))
  async removeMember(@Req() req: any, @Param('id') id: string, @Param('userId') userId: string) {
    return this.membershipService.removeMember(req.user, Number(id), Number(userId));
  }
}