import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  gender?: number;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsNumber()
  balance?: number;
}

export class AdjustPointsDto {
  @IsNumber()
  points: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class AdjustBalanceDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
