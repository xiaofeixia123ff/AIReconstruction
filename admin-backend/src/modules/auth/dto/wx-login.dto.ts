import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WxLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  nickName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
