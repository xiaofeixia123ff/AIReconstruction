import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../role/role.entity';

@Entity('sys_menu')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'Parent menu id, 0 = top level' })
  parentId: number;

  @Column({ length: 50, comment: 'Menu name' })
  name: string;

  @Column({ length: 100, nullable: true, comment: 'Route path' })
  path: string;

  @Column({ length: 200, nullable: true, comment: 'Component path' })
  component: string;

  @Column({ length: 100, nullable: true, comment: 'Permission code, e.g. sys:user:list' })
  permission: string;

  @Column({ length: 50, nullable: true, comment: 'Menu icon' })
  icon: string;

  @Column({ comment: 'Type: 0=directory, 1=menu, 2=button' })
  type: number;

  @Column({ default: 0, comment: 'Sort order' })
  sort: number;

  @Column({ default: 1, comment: 'Status: 1=enabled, 0=disabled' })
  status: number;

  @Column({ default: 1, comment: 'Visible: 1=show, 0=hide' })
  visible: number;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Updated time' })
  updatedAt: Date;

  // Relation: menu belongs to many roles
  @ManyToMany(() => Role, (role) => role.menus)
  @JoinTable({
    name: 'sys_role_menu',
    joinColumn: { name: 'menu_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
