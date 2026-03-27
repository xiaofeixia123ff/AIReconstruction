import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /** GET /api/stats/overview */
  @Get('overview')
  getOverview() {
    return this.statsService.getOverview();
  }

  /** GET /api/stats/sales-trend?days=7 */
  @Get('sales-trend')
  getSalesTrend(@Query('days') days = 7) {
    return this.statsService.getSalesTrend(+days);
  }

  /** GET /api/stats/product-ranking?limit=10 */
  @Get('product-ranking')
  getProductRanking(@Query('limit') limit = 10) {
    return this.statsService.getProductRanking(+limit);
  }

  /** GET /api/stats/order-status */
  @Get('order-status')
  getOrderStatusDist() {
    return this.statsService.getOrderStatusDist();
  }

  /** GET /api/stats/member-trend?days=7 */
  @Get('member-trend')
  getMemberTrend(@Query('days') days = 7) {
    return this.statsService.getMemberTrend(+days);
  }
}
