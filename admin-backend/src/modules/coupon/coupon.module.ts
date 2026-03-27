import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon, CouponRecord } from './coupon.entity';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, CouponRecord])],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
