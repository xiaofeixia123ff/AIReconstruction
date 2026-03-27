import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, ParseIntPipe, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MemberJwtAuthGuard } from '../../common/guards/member-jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto, ShipOrderDto, MiniAppCreateOrderDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /** POST /order/miniapp - Create order from mini program */
  @UseGuards(MemberJwtAuthGuard)
  @Post('miniapp')
  createFromMiniApp(@Body() dto: MiniAppCreateOrderDto, @Req() req: any) {
    const member = req.user;
    return this.orderService.createFromMiniApp(dto, {
      id: member.id,
      nickname: member.nickname,
      phone: member.phone,
    });
  }

  /** GET /order/mine - Get current member's order list (mini program) */
  @UseGuards(MemberJwtAuthGuard)
  @Get('mine')
  getMyOrders(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('status') status?: string,
  ) {
    const member = req.user;
    return this.orderService.findByMember(
      member.id,
      +page,
      +pageSize,
      status !== undefined && status !== '' ? +status : undefined,
    );
  }

  /** GET /order/stats - Get order statistics */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.orderService.getStats();
  }

  /** GET /order - Get order list with pagination */
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findById(id);
  }

  /** POST /order - Create order (admin) */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  /** PUT /order/:id - Update order */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  /** DELETE /order/:id - Delete order */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }

  /** PATCH /order/:id/ship - Ship order */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/ship')
  ship(@Param('id', ParseIntPipe) id: number, @Body() dto: ShipOrderDto) {
    return this.orderService.ship(id, dto);
  }

  /** PATCH /order/:id/cancel - Cancel order */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.cancel(id);
  }

  /** PATCH /order/:id/complete - Complete order */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.complete(id);
  }

  /** PATCH /order/:id/refund - Refund order */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/refund')
  refund(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.refund(id);
  }
}
