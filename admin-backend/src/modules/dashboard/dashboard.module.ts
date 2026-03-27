import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { Menu } from '../menu/menu.entity';
import { Log } from '../log/log.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Menu, Log])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
