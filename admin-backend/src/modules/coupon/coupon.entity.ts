import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Coupon type: 1=fixed amount, 2=percentage discount */
export enum CouponType {
  FIXED = 1,
  PERCENTAGE = 2,
}

/** Coupon status: 0=disabled, 1=enabled */
export enum CouponStatus {
  DISABLED = 0,
  ENABLED = 1,
}

@Entity('shop_coupon')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'Coupon name' })
  name: string;

  @Column({ default: CouponType.FIXED, comment: 'Coupon type: 1=fixed amount, 2=percentage' })
  type: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Discount value (amount or percentage)' })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Minimum order amount to use' })
  minAmount: number;

  @Column({ default: 0, comment: 'Total quantity (0=unlimited)' })
  totalQty: number;

  @Column({ default: 0, comment: 'Used quantity' })
  usedQty: number;

  @Column({ default: 1, comment: 'Per user limit (0=unlimited)' })
  perUserLimit: number;

  @Column({ type: 'datetime', nullable: true, comment: 'Valid start time' })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: 'Valid end time' })
  endTime: Date;

  @Column({ default: CouponStatus.ENABLED, comment: 'Status: 0=disabled, 1=enabled' })
  status: number;

  @Column({ length: 200, nullable: true, comment: 'Description' })
  description: string;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Updated time' })
  updatedAt: Date;
}

@Entity('shop_coupon_record')
export class CouponRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'Coupon id' })
  couponId: number;

  @Column({ comment: 'Member id' })
  memberId: number;

  @Column({ length: 50, nullable: true, comment: 'Member nickname' })
  memberNickname: string;

  @Column({ default: 0, comment: 'Status: 0=unused, 1=used, 2=expired' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: 'Used time' })
  usedAt: Date;

  @Column({ nullable: true, comment: 'Order id when used' })
  orderId: number;

  @CreateDateColumn({ comment: 'Received time' })
  createdAt: Date;
}
