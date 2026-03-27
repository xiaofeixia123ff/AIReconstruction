import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('shop_category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: 'Category name' })
  name: string;

  @Column({ nullable: true, default: null, comment: 'Parent category id' })
  parentId: number;

  @Column({ default: 0, comment: 'Sort order' })
  sort: number;

  @Column({ length: 200, nullable: true, comment: 'Category icon URL' })
  icon: string;

  @Column({ default: 1, comment: 'Status: 1=enabled, 0=disabled' })
  status: number;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Updated time' })
  updatedAt: Date;

  // Self-referencing: parent category
  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  // Self-referencing: child categories
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
