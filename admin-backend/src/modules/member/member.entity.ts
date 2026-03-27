import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Member gender: 0=unknown, 1=male, 2=female */
export enum MemberGender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
}

@Entity('shop_member')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true, comment: 'WeChat openid' })
  openid: string;

  @Column({ length: 100, nullable: true, comment: 'WeChat unionid' })
  unionid: string;

  @Column({ length: 50, nullable: true, comment: 'Nickname' })
  nickname: string;

  @Column({ length: 200, nullable: true, comment: 'Avatar URL' })
  avatar: string;

  @Column({ default: MemberGender.UNKNOWN, comment: 'Gender: 0=unknown, 1=male, 2=female' })
  gender: number;

  @Column({ length: 20, nullable: true, comment: 'Phone number' })
  phone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Balance' })
  balance: number;

  @Column({ default: 0, comment: 'Points' })
  points: number;

  @Column({ default: 1, comment: 'Status: 1=enabled, 0=disabled' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: 'Last login time' })
  lastLoginAt: Date;

  @Column({ length: 50, nullable: true, comment: 'Last login IP' })
  lastLoginIp: string;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Updated time' })
  updatedAt: Date;
}
