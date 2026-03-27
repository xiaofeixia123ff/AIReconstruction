import {
  Controller, Get, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MemberJwtAuthGuard } from '../../common/guards/member-jwt-auth.guard';
import { MemberService } from './member.service';
import { UpdateMemberDto, AdjustPointsDto, AdjustBalanceDto } from './dto/member.dto';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /** GET /member/me - Get current logged-in member info (mini program) */
  @UseGuards(MemberJwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const member = req.user;
    return {
      id: member.id,
      nickName: member.nickname,
      avatarUrl: member.avatar,
      phone: member.phone,
      points: member.points,
      balance: member.balance,
    };
  }

  /** PUT /member/me - Update current logged-in member info (mini program) */
  @UseGuards(MemberJwtAuthGuard)
  @Put('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateMemberDto) {
    const member = req.user;
    const updated = await this.memberService.update(member.id, dto);
    return {
      id: updated.id,
      nickName: updated.nickname,
      avatarUrl: updated.avatar,
      phone: updated.phone,
      points: updated.points,
      balance: updated.balance,
    };
  }

  /** GET /member/stats - Get member statistics */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.memberService.getStats();
  }

  /** GET /member - Get member list with pagination */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword?: string,
    @Query('status') status?: number,
  ) {
    return this.memberService.findAll(+page, +pageSize, keyword, status !== undefined ? +status : undefined);
  }

  /** GET /member/:id - Get member by id */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.findById(id);
  }

  /** PUT /member/:id - Update member info */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemberDto) {
    return this.memberService.update(id, dto);
  }

  /** PATCH /member/:id/status - Toggle member status */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.toggleStatus(id);
  }

  /** PATCH /member/:id/points - Adjust member points */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/points')
  adjustPoints(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustPointsDto) {
    return this.memberService.adjustPoints(id, dto);
  }

  /** PATCH /member/:id/balance - Adjust member balance */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/balance')
  adjustBalance(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustBalanceDto) {
    return this.memberService.adjustBalance(id, dto);
  }
}
