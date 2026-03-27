import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, ResetPasswordDto } from './dto/user.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** GET /user/info - Get current logged-in user info */
  @Get('info')
  getInfo(@Request() req) {
    return req.user;
  }

  /** GET /user - Get user list with pagination */
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword?: string,
  ) {
    return this.userService.findAll(+page, +pageSize, keyword);
  }

  /** GET /user/:id - Get user by id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  /** POST /user - Create user */
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  /** PUT /user/:id - Update user */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  /** DELETE /user/:id - Delete user */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  /** PATCH /user/password - Change own password */
  @Patch('password')
  updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.userService.updatePassword(req.user.id, dto);
  }

  /** PATCH /user/:id/reset-password - Admin reset user password */
  @Patch(':id/reset-password')
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(id, dto);
  }
}
