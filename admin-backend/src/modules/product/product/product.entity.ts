import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';

@Entity('shop_product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: 'Product name' })
  name: string;

  @Column({ nullable: true, comment: 'Category id' })
  categoryId: number;

  @Column({ length: 50, nullable: true, comment: 'Product code / SKU' })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Selling price' })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Original price' })
  originalPrice: number;

  @Column({ default: 0, comment: 'Stock quantity' })
  stock: number;

  @Column({ length: 500, nullable: true, comment: 'Main image URL' })
  mainImage: string;

  @Column({ type: 'text', nullable: true, comment: 'Product images (JSON array)' })
  images: string;

  @Column({ length: 200, nullable: true, comment: 'Short description' })
  description: string;

  @Column({ type: 'longtext', nullable: true, comment: 'Product detail (rich text)' })
  detail: string;

  @Column({ default: 0, comment: 'Sales count' })
  sales: number;

  @Column({ default: 0, comment: 'Sort order' })
  sort: number;

  @Column({ default: 1, comment: 'Status: 1=on-sale, 0=off-sale' })
  status: number;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Updated time' })
  updatedAt: Date;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
