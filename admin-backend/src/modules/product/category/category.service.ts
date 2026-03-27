import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /** Get all categories as tree structure */
  async findTree(): Promise<Category[]> {
    const all = await this.categoryRepository.find({
      order: { sort: 'ASC', createdAt: 'ASC' },
    });
    return this.buildTree(all, null);
  }

  /** Get flat list with pagination */
  async findAll(page: number, pageSize: number, keyword?: string) {
    const qb = this.categoryRepository.createQueryBuilder('c');
    if (keyword) {
      qb.where('c.name LIKE :keyword', { keyword: `%${keyword}%` });
    }
    qb.orderBy('c.sort', 'ASC').addOrderBy('c.createdAt', 'ASC');
    qb.skip((page - 1) * pageSize).take(pageSize);
    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, pageSize };
  }

  /** Create category */
  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoryRepository.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException(`Category "${dto.name}" already exists`);
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  /** Update category */
  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  /** Delete category */
  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    // Check if has children
    const children = await this.categoryRepository.find({ where: { parentId: id } });
    if (children.length > 0) {
      throw new ConflictException('Cannot delete category with sub-categories');
    }
    await this.categoryRepository.remove(category);
  }

  /** Build tree from flat list */
  private buildTree(list: Category[], parentId: number | null): Category[] {
    return list
      .filter((item) => (item.parentId ?? null) === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(list, item.id),
      }));
  }
}
