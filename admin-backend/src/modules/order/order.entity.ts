import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Order status: 0=pending payment, 1=pending shipment, 2=shipped, 3=completed, 4=cancelled, 5=refunded */
export enum OrderStatus {
  PENDING_PAYMENT = 0,
  PENDING_SHIPMENT = 1,
  SHIPPED = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  REFUNDED = 5,
}

@Entity('shop_order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, unique: true, comment: 'Order number' })
  orderNo: string;

  @Column({ nullable: true, comment: 'WeChat user id (mini program)' })
  userId: number;

  @Column({ length: 50, nullable: true, comment: 'Buyer nickname' })
  nickname: string;

  @Column({ length: 20, nullable: true, comment: 'Buyer phone' })
  phone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Total amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Actual paid amount' })
  payAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Freight amount' })
  freightAmount: number;

  @Column({ default: OrderStatus.PENDING_PAYMENT, comment: 'Order status' })
  status: number;

  @Column({ length: 50, nullable: true, comment: 'Receiver name' })
  receiverName: string;

  @Column({ length: 20, nullable: true, comment: 'Receiver phone' })
  receiverPhone: string;

  @Column({ length: 200, nullable: true, comment: 'Receiver address' })
  receiverAddress: string;

  @Column({ length: 50, nullable: true, comment: 'Express company' })
  expressCompany: string;

  @Column({ length: 50, nullable: true, comment: 'Express tracking number' })
  expressNo: string;

  @Column({ type: 'datetime', nullable: true, comment: 'Payment time' })
  payTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: 'Shipment time' })
  shipTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: 'Completion time' })
  completeTime: Date;

  @Column({ length: 200, nullable: true, comment: 'Order remark' })
  remark: string;

  @Column({ type: 'text', nullable: true, comment: 'Order items snapshot (JSON)' })
  itemsSnapshot: string;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Updated time' })
  updatedAt: Date;
}
