import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Order } from '../order/order.entity';
import { Product } from '../product/product/product.entity';
import { Member } from '../member/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Member])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
