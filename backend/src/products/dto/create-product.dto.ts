import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductCategory } from '../enums/product-category.enum';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  /** Base price in KZT (Kazakhstani Tenge) */
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  basePrice: number;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory = ProductCategory.COFFEE;

  @IsString()
  @IsOptional()
  imageUrl?: string;
} 