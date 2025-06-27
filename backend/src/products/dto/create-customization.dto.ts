import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { CustomizationType } from '../enums/customization-type.enum';

export class CreateCustomizationDto {
  @IsString()
  productId: string;

  @IsEnum(CustomizationType)
  type: CustomizationType;

  @IsString()
  name: string;

  /** Additional price in KZT (Kazakhstani Tenge) for this customization */
  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
} 