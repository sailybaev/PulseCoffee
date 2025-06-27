import { IsEnum, IsOptional, IsArray, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  /** Price per item in KZT (Kazakhstani Tenge) */
  @IsNumber()
  price: number;
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsOptional()
  items?: UpdateOrderItemDto[];

  /** Total order amount in KZT (Kazakhstani Tenge) */
  @IsNumber()
  @IsOptional()
  total?: number;
} 