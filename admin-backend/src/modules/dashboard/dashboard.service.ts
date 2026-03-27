import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { Menu } from '../menu/menu.entity';
import { Log } from '../log/log.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  /** Get overview statistics */
  async getStats() {
    const [totalUsers, totalRoles, totalMenus] = await Promise.all([
      this.userRepository.count(),
      this.roleRepository.count(),
      this.menuRepository.count(),
    ]);

    // Today's login count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayLogins = await this.logRepository.count({
      where: {
        module: 'Auth',
        description: 'User login',
        createdAt: Between(todayStart, todayEnd),
      },
    });

    return { totalUsers, totalRoles, totalMenus, todayLogins };
  }

  /** Get login trend for the last 7 days */
  async getLoginTrend() {
    const result: { date: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await this.logRepository.count({
        where: {
          module: 'Auth',
          description: 'User login',
          createdAt: Between(day, dayEnd),
        },
      });

      result.push({
        date: day.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        count,
      });
    }

    return result;
  }

  /** Get recent operation logs */
  async getRecentLogs(limit = 10) {
    return this.logRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
