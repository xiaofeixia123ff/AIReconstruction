import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { Role } from '../role/role.entity';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, ResetPasswordDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** Find user by username (used in login) */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.menus'],
    });
  }

  /** Find user by id */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.menus'],
    });
  }

  /** Update last login info */
  async updateLoginInfo(id: number, ip: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }

  /** Get user list with pagination and search */
  async findAll(page: number, pageSize: number, keyword?: string) {
    const where: any = {};
    if (keyword) {
      where.username = Like(`%${keyword}%`);
    }

    const [list, total] = await this.userRepository.findAndCount({
      where,
      relations: ['roles'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Remove password from results
    const safeList = list.map(({ password, ...user }) => user);
    return { list: safeList, total, page, pageSize };
  }

  /** Create user */
  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const exists = await this.userRepository.findOne({ where: { username: dto.username } });
    if (exists) throw new ConflictException(`Username "${dto.username}" already exists`);

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      username: dto.username,
      password: hashed,
      nickname: dto.nickname,
      email: dto.email,
      phone: dto.phone,
    });

    if (dto.roleIds?.length) {
      user.roles = dto.roleIds.map((id) => ({ id } as Role));
    }

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  /** Update user */
  async update(id: number, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    Object.assign(user, {
      ...(dto.nickname !== undefined && { nickname: dto.nickname }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      ...(dto.status !== undefined && { status: dto.status }),
    });

    if (dto.roleIds !== undefined) {
      user.roles = dto.roleIds.map((id) => ({ id } as Role));
    }

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  /** Delete user */
  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    await this.userRepository.remove(user);
  }

  /** Change password (self) */
  async updatePassword(id: number, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
  }

  /** Reset password (admin) */
  async resetPassword(id: number, dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    user.password = await bcrypt.hash(dto.password, 10);
    await this.userRepository.save(user);
  }
}
