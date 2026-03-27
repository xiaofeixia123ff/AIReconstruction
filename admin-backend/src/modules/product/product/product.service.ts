import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /** Get product list with pagination and filters */
  async findAll(page: number, pageSize: number, keyword?: string, categoryId?: number, status?: number) {
    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category');

    if (keyword) {
      qb.andWhere('(p.name LIKE :keyword OR p.code LIKE :keyword)', { keyword: `%${keyword}%` });
    }
    if (categoryId !== undefined) {
      qb.andWhere('p.categoryId = :categoryId', { categoryId });
    }
    if (status !== undefined) {
      qb.andWhere('p.status = :status', { status });
    }

    qb.orderBy('p.sort', 'ASC').addOrderBy('p.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, pageSize };
  }

  /** Get product by id */
  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  /** Create product */
  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  /** Update product */
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  /** Delete product */
  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    await this.productRepository.remove(product);
  }

  /** Toggle product status (on-sale / off-sale) */
  async toggleStatus(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    product.status = product.status === 1 ? 0 : 1;
    return this.productRepository.save(product);
  }
}
