import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order.entity';

/** Mini program order item */
export class MiniAppOrderItemDto {
  @Type(() => Number)
  @IsNumber()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  price: number;
}

/** Mini program order address */
export class MiniAppOrderAddressDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsString()
  detail: string;
}

/** Mini program create order DTO */
export class MiniAppCreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MiniAppOrderItemDto)
  items: MiniAppOrderItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => MiniAppOrderAddressDto)
  address: MiniAppOrderAddressDto;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  couponId?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @Type(() => Number)
  @IsNumber()
  totalAmount: number;
}

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
