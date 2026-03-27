import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /** GET /menu - Get all menus (flat list) */
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  /** GET /menu/tree - Get menus as tree */
  @Get('tree')
  findTree() {
    return this.menuService.findTree();
  }

  /** GET /menu/:id - Get menu by id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findById(id);
  }

  /** POST /menu - Create menu */
  @Post()
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  /** PUT /menu/:id - Update menu */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  /** DELETE /menu/:id - Delete menu */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
