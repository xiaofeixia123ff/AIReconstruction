import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './role.entity';
import { Menu } from '../menu/menu.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /** Get all roles (with menu count) */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['menus'],
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  /** Get role by id */
  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['menus'],
    });
    if (!role) throw new NotFoundException(`Role #${id} not found`);
    return role;
  }

  /** Create role */
  async create(dto: CreateRoleDto): Promise<Role> {
    // Check duplicate code
    const exists = await this.roleRepository.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`Role code "${dto.code}" already exists`);

    const role = this.roleRepository.create({
      name: dto.name,
      code: dto.code,
      description: dto.description,
      sort: dto.sort ?? 0,
    });

    // Assign menus if provided
    if (dto.menuIds?.length) {
      role.menus = dto.menuIds.map((id) => ({ id } as Menu));
    }

    return this.roleRepository.save(role);
  }

  /** Update role */
  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);

    if (dto.code && dto.code !== role.code) {
      const exists = await this.roleRepository.findOne({ where: { code: dto.code } });
      if (exists) throw new ConflictException(`Role code "${dto.code}" already exists`);
    }

    Object.assign(role, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.code !== undefined && { code: dto.code }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.sort !== undefined && { sort: dto.sort }),
      ...(dto.status !== undefined && { status: dto.status }),
    });

    // Update menus if provided
    if (dto.menuIds !== undefined) {
      role.menus = dto.menuIds.map((id) => ({ id } as Menu));
    }

    return this.roleRepository.save(role);
  }

  /** Delete role */
  async remove(id: number): Promise<void> {
    const role = await this.findById(id);
    await this.roleRepository.remove(role);
  }

  /** Find roles by ids (used when assigning roles to user) */
  async findByIds(ids: number[]): Promise<Role[]> {
    return this.roleRepository.findBy({ id: In(ids) });
  }
}
