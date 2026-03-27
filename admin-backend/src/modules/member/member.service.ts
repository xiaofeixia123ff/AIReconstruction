import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Member } from './member.entity';
import { UpdateMemberDto, AdjustPointsDto, AdjustBalanceDto } from './dto/member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  /** Get member list with pagination and search */
  async findAll(page: number, pageSize: number, keyword?: string, status?: number) {
    const where: any = {};
    if (keyword) {
      where.nickname = Like(`%${keyword}%`);
    }
    if (status !== undefined && status !== null) {
      where.status = status;
    }

    const [list, total] = await this.memberRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total, page, pageSize };
  }

  /** Get member by id */
  async findById(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) throw new NotFoundException(`Member #${id} not found`);
    return member;
  }

  /** Update member info */
  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findById(id);
    Object.assign(member, dto);
    return this.memberRepository.save(member);
  }

  /** Toggle member status */
  async toggleStatus(id: number): Promise<Member> {
    const member = await this.findById(id);
    member.status = member.status === 1 ? 0 : 1;
    return this.memberRepository.save(member);
  }

  /** Adjust member points */
  async adjustPoints(id: number, dto: AdjustPointsDto): Promise<Member> {
    const member = await this.findById(id);
    member.points = Math.max(0, member.points + dto.points);
    return this.memberRepository.save(member);
  }

  /** Adjust member balance */
  async adjustBalance(id: number, dto: AdjustBalanceDto): Promise<Member> {
    const member = await this.findById(id);
    const newBalance = parseFloat(member.balance as any) + dto.amount;
    member.balance = Math.max(0, newBalance);
    return this.memberRepository.save(member);
  }

  /** Find member by openid */
  async findByOpenid(openid: string): Promise<Member | null> {
    return this.memberRepository.findOne({ where: { openid } });
  }

  /** Create member via WeChat login */
  async createByWx(data: {
    openid: string;
    unionid?: string;
    nickname: string;
    avatar: string;
    lastLoginIp?: string;
  }): Promise<Member> {
    const member = this.memberRepository.create({
      openid: data.openid,
      unionid: data.unionid || '',
      nickname: data.nickname,
      avatar: data.avatar,
      lastLoginAt: new Date(),
      lastLoginIp: data.lastLoginIp || '',
      status: 1,
    });
    return this.memberRepository.save(member);
  }

  /** Update member login info */
  async updateLoginInfo(
    id: number,
    ip: string,
    profile?: { nickname?: string; avatar?: string },
  ): Promise<void> {
    const updateData: any = { lastLoginAt: new Date(), lastLoginIp: ip };
    if (profile?.nickname) updateData.nickname = profile.nickname;
    if (profile?.avatar) updateData.avatar = profile.avatar;
    await this.memberRepository.update(id, updateData);
  }

  /** Get member statistics */
  async getStats() {
    const total = await this.memberRepository.count();
    const active = await this.memberRepository.count({ where: { status: 1 } });
    const disabled = await this.memberRepository.count({ where: { status: 0 } });

    // New members today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNew = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.createdAt >= :today', { today })
      .getCount();

    return { total, active, disabled, todayNew };
  }
}
