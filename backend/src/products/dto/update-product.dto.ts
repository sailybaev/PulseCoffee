import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ProductCategory } from '../enums/product-category.enum';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsString()
  @IsOptional()
  imageUrl?: string;
} 