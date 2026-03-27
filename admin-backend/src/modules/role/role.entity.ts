import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Menu } from '../menu/menu.entity';

@Entity('sys_role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, comment: 'Role name' })
  name: string;

  @Column({ length: 100, unique: true, comment: 'Role code, e.g. ROLE_ADMIN' })
  code: string;

  @Column({ length: 200, nullable: true, comment: 'Role description' })
  description: string;

  @Column({ default: 1, comment: 'Status: 1=enabled, 0=disabled' })
  status: number;

  @Column({ default: 0, comment: 'Sort order' })
  sort: number;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Updated time' })
  updatedAt: Date;

  // Relation: role has many users
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  // Relation: role has many menus
  @ManyToMany(() => Menu, (menu) => menu.roles, { cascade: true })
  menus: Menu[];
}
