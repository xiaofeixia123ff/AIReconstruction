import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { OrderStatus } from '../order.entity';

export class CreateOrderDto {
  @IsString()
  orderNo: string;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  payAmount: number;

  @IsOptional()
  @IsNumber()
  freightAmount?: number;

  @IsOptional()
  @IsString()
  receiverName?: string;

  @IsOptional()
  @IsString()
  receiverPhone?: string;

  @IsOptional()
  @IsString()
  receiverAddress?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  itemsSnapshot?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: number;

  @IsOptional()
  @IsString()
  expressCompany?: string;

  @IsOptional()
  @IsString()
  expressNo?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class ShipOrderDto {
  @IsString()
  expressCompany: string;

  @IsString()
  expressNo: string;
}
