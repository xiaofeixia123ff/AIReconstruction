import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Coupon, CouponRecord } from './coupon.entity';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
    @InjectRepository(CouponRecord)
    private recordRepo: Repository<CouponRecord>,
  ) {}

  /** Get coupon list with pagination */
  async findAll(page = 1, pageSize = 10, keyword?: string, status?: number) {
    const where: any = {};
    if (keyword) where.name = Like(`%${keyword}%`);
    if (status !== undefined) where.status = status;

    const [list, total] = await this.couponRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  /** Get coupon detail */
  async findOne(id: number) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon #${id} not found`);
    return coupon;
  }

  /** Create coupon */
  async create(dto: CreateCouponDto) {
    const coupon = this.couponRepo.create(dto);
    return this.couponRepo.save(coupon);
  }

  /** Update coupon */
  async update(id: number, dto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    Object.assign(coupon, dto);
    return this.couponRepo.save(coupon);
  }

  /** Toggle coupon status */
  async toggleStatus(id: number) {
    const coupon = await this.findOne(id);
    coupon.status = coupon.status === 1 ? 0 : 1;
    return this.couponRepo.save(coupon);
  }

  /** Delete coupon */
  async remove(id: number) {
    const coupon = await this.findOne(id);
    if (coupon.usedQty > 0) {
      throw new BadRequestException('Cannot delete coupon that has been used');
    }
    await this.couponRepo.remove(coupon);
    return { message: 'Deleted successfully' };
  }

  /** Get coupon stats */
  async getStats() {
    const total = await this.couponRepo.count();
    const enabled = await this.couponRepo.count({ where: { status: 1 } });
    const disabled = await this.couponRepo.count({ where: { status: 0 } });
    const totalUsed = await this.recordRepo.count();
    return { total, enabled, disabled, totalUsed };
  }

  /** Get my coupons (mini program) */
  async getMyCoupons(memberId: number, status?: string) {
    const qb = this.recordRepo.createQueryBuilder('r');
    qb.where('r.memberId = :memberId', { memberId });

    // Map string status to number
    if (status === 'unused') {
      qb.andWhere('r.status = 0');
    } else if (status === 'used') {
      qb.andWhere('r.status = 1');
    } else if (status === 'expired') {
      qb.andWhere('r.status = 2');
    }

    qb.orderBy('r.createdAt', 'DESC');
    const records = await qb.getMany();

    // Attach coupon detail to each record
    const couponIds = [...new Set(records.map(r => r.couponId))];
    const coupons = couponIds.length > 0
      ? await this.couponRepo.findByIds(couponIds)
      : [];
    const couponMap = new Map(coupons.map(c => [c.id, c]));

    return records.map(r => ({
      ...r,
      coupon: couponMap.get(r.couponId) || null,
    }));
  }

  /** Get coupon records (who received/used) */
  async getRecords(couponId: number, page = 1, pageSize = 10) {
    const [list, total] = await this.recordRepo.findAndCount({
      where: { couponId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }
}
