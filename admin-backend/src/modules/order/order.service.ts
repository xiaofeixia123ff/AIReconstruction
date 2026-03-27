import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto, UpdateOrderDto, ShipOrderDto, MiniAppCreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /** Get order list with pagination and filters */
  async findAll(
    page: number,
    pageSize: number,
    keyword?: string,
    status?: number,
    startDate?: string,
    endDate?: string,
  ) {
    const qb = this.orderRepository.createQueryBuilder('o');

    if (keyword) {
      qb.andWhere(
        '(o.orderNo LIKE :keyword OR o.nickname LIKE :keyword OR o.phone LIKE :keyword OR o.receiverName LIKE :keyword OR o.receiverPhone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }
    if (status !== undefined) {
      qb.andWhere('o.status = :status', { status });
    }
    if (startDate) {
      qb.andWhere('o.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('o.createdAt <= :endDate', { endDate: endDate + ' 23:59:59' });
    }

    qb.orderBy('o.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, pageSize };
  }

  /** Get order by id */
  async findById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  /** Create order */
  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(dto);
    return this.orderRepository.save(order);
  }

  /** Create order from mini program */
  async createFromMiniApp(dto: MiniAppCreateOrderDto, member: { id: number; nickname: string; phone?: string }): Promise<Order> {
    const { items, address, remark, totalAmount } = dto;

    // Generate order number: timestamp + random 6 digits
    const orderNo = `${Date.now()}${Math.floor(Math.random() * 900000) + 100000}`;

    // Build full address string
    const fullAddress = [address.province, address.city, address.district, address.detail]
      .filter(Boolean)
      .join(' ');

    // Calculate pay amount (same as totalAmount for now, coupon deduction already done on frontend)
    const payAmount = totalAmount / 100; // frontend sends in fen, convert to yuan
    const totalAmountYuan = totalAmount / 100;

    const order = this.orderRepository.create({
      orderNo,
      userId: member.id,
      nickname: member.nickname,
      phone: member.phone || address.phone,
      totalAmount: totalAmountYuan,
      payAmount,
      freightAmount: 0,
      status: OrderStatus.PENDING_PAYMENT,
      receiverName: address.name,
      receiverPhone: address.phone,
      receiverAddress: fullAddress,
      remark: remark || '',
      itemsSnapshot: JSON.stringify(items),
    });

    return this.orderRepository.save(order);
  }

  /** Update order */
  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    Object.assign(order, dto);
    return this.orderRepository.save(order);
  }

  /** Delete order */
  async remove(id: number): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    await this.orderRepository.remove(order);
  }

  /** Ship order - fill express info and change status to shipped */
  async ship(id: number, dto: ShipOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    if (order.status !== OrderStatus.PENDING_SHIPMENT) {
      throw new BadRequestException('Only pending-shipment orders can be shipped');
    }
    order.expressCompany = dto.expressCompany;
    order.expressNo = dto.expressNo;
    order.status = OrderStatus.SHIPPED;
    order.shipTime = new Date();
    return this.orderRepository.save(order);
  }

  /** Cancel order */
  async cancel(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    if (![OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING_SHIPMENT].includes(order.status)) {
      throw new BadRequestException('Only pending-payment or pending-shipment orders can be cancelled');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  /** Complete order */
  async complete(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException('Only shipped orders can be completed');
    }
    order.status = OrderStatus.COMPLETED;
    order.completeTime = new Date();
    return this.orderRepository.save(order);
  }

  /** Refund order */
  async refund(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    if (![OrderStatus.COMPLETED, OrderStatus.SHIPPED].includes(order.status)) {
      throw new BadRequestException('Only completed or shipped orders can be refunded');
    }
    order.status = OrderStatus.REFUNDED;
    return this.orderRepository.save(order);
  }

  /** Get orders by member id (mini program) */
  async findByMember(memberId: number, page: number, pageSize: number, status?: number) {
    const qb = this.orderRepository.createQueryBuilder('o');
    qb.where('o.userId = :memberId', { memberId });
    if (status !== undefined) {
      qb.andWhere('o.status = :status', { status });
    }
    qb.orderBy('o.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);
    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, pageSize };
  }

  /** Get order statistics */
  async getStats() {
    const total = await this.orderRepository.count();
    const pendingPayment = await this.orderRepository.count({ where: { status: OrderStatus.PENDING_PAYMENT } });
    const pendingShipment = await this.orderRepository.count({ where: { status: OrderStatus.PENDING_SHIPMENT } });
    const shipped = await this.orderRepository.count({ where: { status: OrderStatus.SHIPPED } });
    const completed = await this.orderRepository.count({ where: { status: OrderStatus.COMPLETED } });
    const cancelled = await this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } });
    const refunded = await this.orderRepository.count({ where: { status: OrderStatus.REFUNDED } });
    return { total, pendingPayment, pendingShipment, shipped, completed, cancelled, refunded };
  }
}
