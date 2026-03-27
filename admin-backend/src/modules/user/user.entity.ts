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

@Entity('sys_user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, comment: 'Username' })
  username: string;

  @Column({ length: 200, comment: 'Password (hashed)' })
  password: string;

  @Column({ length: 50, nullable: true, comment: 'Nickname' })
  nickname: string;

  @Column({ length: 100, nullable: true, comment: 'Email' })
  email: string;

  @Column({ length: 20, nullable: true, comment: 'Phone number' })
  phone: string;

  @Column({ length: 200, nullable: true, comment: 'Avatar URL' })
  avatar: string;

  @Column({ default: 1, comment: 'Status: 1=enabled, 0=disabled' })
  status: number;

  @Column({ nullable: true, comment: 'Last login time' })
  lastLoginAt: Date;

  @Column({ length: 50, nullable: true, comment: 'Last login IP' })
  lastLoginIp: string;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Updated time' })
  updatedAt: Date;

  // Relation: user has many roles
  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'sys_user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
