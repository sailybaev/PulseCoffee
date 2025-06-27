import { IsString, IsNumber } from 'class-validator';

export class AddProductToBranchDto {
  @IsString()
  productId: string;

  @IsString()
  branchId: string;

  /** Price in KZT (Kazakhstani Tenge) for this product at this branch */
  @IsNumber()
  price: number;
} 