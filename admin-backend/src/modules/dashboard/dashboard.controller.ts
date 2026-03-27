import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** GET /dashboard/stats - Overview statistics */
  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  /** GET /dashboard/login-trend - Login trend for last 7 days */
  @Get('login-trend')
  getLoginTrend() {
    return this.dashboardService.getLoginTrend();
  }

  /** GET /dashboard/recent-logs - Recent operation logs */
  @Get('recent-logs')
  getRecentLogs(@Query('limit') limit = 10) {
    return this.dashboardService.getRecentLogs(+limit);
  }
}
