import {
  Controller, Get, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MemberService } from './member.service';
import { UpdateMemberDto, AdjustPointsDto, AdjustBalanceDto } from './dto/member.dto';

@UseGuards(JwtAuthGuard)
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /** GET /member/stats - Get member statistics */
  @Get('stats')
  getStats() {
    return this.memberService.getStats();
  }

  /** GET /member - Get member list with pagination */
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
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.findById(id);
  }

  /** PUT /member/:id - Update member info */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemberDto) {
    return this.memberService.update(id, dto);
  }

  /** PATCH /member/:id/status - Toggle member status */
  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.toggleStatus(id);
  }

  /** PATCH /member/:id/points - Adjust member points */
  @Patch(':id/points')
  adjustPoints(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustPointsDto) {
    return this.memberService.adjustPoints(id, dto);
  }

  /** PATCH /member/:id/balance - Adjust member balance */
  @Patch(':id/balance')
  adjustBalance(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustBalanceDto) {
    return this.memberService.adjustBalance(id, dto);
  }
}
