import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Controller('coupon')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /** GET /api/coupon/stats */
  @Get('stats')
  getStats() {
    return this.couponService.getStats();
  }

  /** GET /api/coupon */
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword?: string,
    @Query('status') status?: number,
  ) {
    return this.couponService.findAll(+page, +pageSize, keyword, status !== undefined ? +status : undefined);
  }

  /** GET /api/coupon/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.findOne(id);
  }

  /** POST /api/coupon */
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  /** PUT /api/coupon/:id */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  /** PATCH /api/coupon/:id/status */
  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.toggleStatus(id);
  }

  /** DELETE /api/coupon/:id */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.remove(id);
  }

  /** GET /api/coupon/:id/records */
  @Get(':id/records')
  getRecords(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.couponService.getRecords(id, +page, +pageSize);
  }
}
