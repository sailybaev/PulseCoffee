import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  basePrice: number;
}

export class AddProductToBranchDto {
  @IsString()
  productId: string;

  @IsString()
  branchId: string;

  @IsNumber()
  price: number;
} 