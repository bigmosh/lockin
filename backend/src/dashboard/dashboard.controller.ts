import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@Req() req: any) {
    return this.dashboardService.getDashboard(req.user);
  }

  @Get('me/upcoming-events')
  @UseGuards(AuthGuard('jwt'))
  async upcomingEvents(@Req() req: any) {
    const events = await this.dashboardService.getUpcomingEvents(req.user, 30);
    return events.map((e) => ({
      room_id: e.room_id,
      room_name: e.room_name,
      start_time: e.start_time,
      meet_link: e.meet_link,
    }));
  }
}