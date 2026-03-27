import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';
import { Product } from '../product/product/product.entity';
import { Member } from '../member/member.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Member) private memberRepo: Repository<Member>,
  ) {}

  /** Overview: total orders, total revenue, total members, total products */
  async getOverview() {
    const [totalOrders, totalMembers, totalProducts] = await Promise.all([
      this.orderRepo.count(),
      this.memberRepo.count(),
      this.productRepo.count({ where: { status: 1 } }),
    ]);

    const revenueResult = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.payAmount)', 'total')
      .where('o.status IN (:...statuses)', { statuses: [1, 2, 3] })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    return { totalOrders, totalRevenue, totalMembers, totalProducts };
  }

  /**
   * Sales trend: daily order count + revenue for the past N days
   * @param days 7 | 15 | 30
   */
  async getSalesTrend(days: number = 7) {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select("DATE_FORMAT(o.createdAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('SUM(CASE WHEN o.status IN (1,2,3) THEN o.payAmount ELSE 0 END)', 'revenue')
      .where('o.createdAt >= DATE_SUB(CURDATE(), INTERVAL :days DAY)', { days })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Fill in missing dates with 0
    const dateMap = new Map<string, { orderCount: number; revenue: number }>();
    result.forEach((r) => {
      dateMap.set(r.date, {
        orderCount: parseInt(r.orderCount),
        revenue: parseFloat(r.revenue || '0'),
      });
    });

    const dates: string[] = [];
    const orderCounts: number[] = [];
    const revenues: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dates.push(dateStr);
      const item = dateMap.get(dateStr);
      orderCounts.push(item?.orderCount ?? 0);
      revenues.push(item ? parseFloat(item.revenue.toFixed(2)) : 0);
    }

    return { dates, orderCounts, revenues };
  }

  /**
   * Product sales ranking: top N products by sales count
   * @param limit top N, default 10
   */
  async getProductRanking(limit: number = 10) {
    const result = await this.productRepo
      .createQueryBuilder('p')
      .select(['p.id', 'p.name', 'p.sales', 'p.price', 'p.mainImage'])
      .where('p.status = 1')
      .orderBy('p.sales', 'DESC')
      .take(limit)
      .getMany();

    return result.map((p) => ({
      id: p.id,
      name: p.name,
      sales: p.sales,
      price: Number(p.price),
      mainImage: p.mainImage,
    }));
  }

  /**
   * Order status distribution
   */
  async getOrderStatusDist() {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(o.id)', 'count')
      .groupBy('o.status')
      .getRawMany();

    const statusLabels: Record<number, string> = {
      0: 'Pending Payment',
      1: 'Pending Shipment',
      2: 'Shipped',
      3: 'Completed',
      4: 'Cancelled',
      5: 'Refunded',
    };

    return result.map((r) => ({
      status: parseInt(r.status),
      label: statusLabels[parseInt(r.status)] ?? 'Unknown',
      count: parseInt(r.count),
    }));
  }

  /**
   * New member trend: daily new member count for the past N days
   */
  async getMemberTrend(days: number = 7) {
    const result = await this.memberRepo
      .createQueryBuilder('m')
      .select("DATE_FORMAT(m.createdAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(m.id)', 'count')
      .where('m.createdAt >= DATE_SUB(CURDATE(), INTERVAL :days DAY)', { days })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    const dateMap = new Map<string, number>();
    result.forEach((r) => dateMap.set(r.date, parseInt(r.count)));

    const dates: string[] = [];
    const counts: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dates.push(dateStr);
      counts.push(dateMap.get(dateStr) ?? 0);
    }

    return { dates, counts };
  }
}
