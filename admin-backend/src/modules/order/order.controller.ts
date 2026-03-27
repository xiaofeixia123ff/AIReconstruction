import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto, ShipOrderDto } from './dto/order.dto';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /** GET /order/stats - Get order statistics */
  @Get('stats')
  getStats() {
    return this.orderService.getStats();
  }

  /** GET /order - Get order list with pagination */
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.findAll(
      +page,
      +pageSize,
      keyword,
      status !== undefined && status !== '' ? +status : undefined,
      startDate,
      endDate,
    );
  }

  /** GET /order/:id - Get order detail */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findById(id);
  }

  /** POST /order - Create order */
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  /** PUT /order/:id - Update order */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  /** DELETE /order/:id - Delete order */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }

  /** PATCH /order/:id/ship - Ship order */
  @Patch(':id/ship')
  ship(@Param('id', ParseIntPipe) id: number, @Body() dto: ShipOrderDto) {
    return this.orderService.ship(id, dto);
  }

  /** PATCH /order/:id/cancel - Cancel order */
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.cancel(id);
  }

  /** PATCH /order/:id/complete - Complete order */
  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.complete(id);
  }

  /** PATCH /order/:id/refund - Refund order */
  @Patch(':id/refund')
  refund(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.refund(id);
  }
}
