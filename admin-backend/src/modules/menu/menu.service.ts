import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  /** Get all menus as flat list */
  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({
      order: { sort: 'ASC', createdAt: 'ASC' },
    });
  }

  /** Get menus as tree structure */
  async findTree(): Promise<any[]> {
    const menus = await this.findAll();
    return this.buildTree(menus, 0);
  }

  /** Build tree from flat list */
  private buildTree(menus: Menu[], parentId: number): any[] {
    return menus
      .filter((m) => m.parentId === parentId)
      .map((m) => ({
        ...m,
        children: this.buildTree(menus, m.id),
      }));
  }

  /** Get menu by id */
  async findById(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);
    return menu;
  }

  /** Create menu */
  async create(dto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create({
      parentId: dto.parentId,
      name: dto.name,
      path: dto.path,
      component: dto.component,
      permission: dto.permission,
      icon: dto.icon,
      type: dto.type,
      sort: dto.sort ?? 0,
      visible: dto.visible ?? 1,
    });
    return this.menuRepository.save(menu);
  }

  /** Update menu */
  async update(id: number, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findById(id);
    Object.assign(menu, dto);
    return this.menuRepository.save(menu);
  }

  /** Delete menu */
  async remove(id: number): Promise<void> {
    const menu = await this.findById(id);
    await this.menuRepository.remove(menu);
  }

  /** Get menus by role ids (for current user's permissions) */
  async findMenusByRoleIds(roleIds: number[]): Promise<Menu[]> {
    if (!roleIds.length) return [];
    return this.menuRepository
      .createQueryBuilder('menu')
      .innerJoin('menu.roles', 'role')
      .where('role.id IN (:...roleIds)', { roleIds })
      .andWhere('menu.status = 1')
      .orderBy('menu.sort', 'ASC')
      .getMany();
  }
}
