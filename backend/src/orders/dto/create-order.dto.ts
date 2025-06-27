import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemCustomizationDto {
  @IsString()
  productCustomizationId: string;
}

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  /** Price per item in KZT (Kazakhstani Tenge) */
  @IsNumber()
  price: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemCustomizationDto)
  customizations?: OrderItemCustomizationDto[];
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  userId: string | null; // Can be null for public orders

  @IsString()
  branchId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  /** Total order amount in KZT (Kazakhstani Tenge) */
  @IsNumber()
  total: number;

  /** Optional customer name for public orders */
  @IsOptional()
  @IsString()
  customerName?: string; // Optional field for public orders

  @IsOptional()
  @IsString()
  paymentMethod?: 'QR' | 'CARD';
  
  @IsOptional()
  @IsString()
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
}