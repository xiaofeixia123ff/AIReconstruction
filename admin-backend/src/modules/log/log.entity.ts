import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sys_log')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, comment: 'Operator user id' })
  userId: number;

  @Column({ length: 50, nullable: true, comment: 'Operator username' })
  username: string;

  @Column({ length: 50, comment: 'Module name' })
  module: string;

  @Column({ length: 200, comment: 'Operation description' })
  description: string;

  @Column({ length: 10, comment: 'HTTP method: GET/POST/PUT/DELETE' })
  method: string;

  @Column({ length: 200, comment: 'Request URL' })
  url: string;

  @Column({ type: 'text', nullable: true, comment: 'Request params' })
  params: string;

  @Column({ type: 'text', nullable: true, comment: 'Request body' })
  body: string;

  @Column({ nullable: true, comment: 'Response status code' })
  status: number;

  @Column({ nullable: true, comment: 'Execution time (ms)' })
  duration: number;

  @Column({ length: 50, nullable: true, comment: 'Client IP' })
  ip: string;

  @CreateDateColumn({ comment: 'Created time' })
  createdAt: Date;
}
