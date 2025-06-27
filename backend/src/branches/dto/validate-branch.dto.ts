import { IsNotEmpty, IsString, IsObject, IsNumber } from 'class-validator';

export class ValidateBranchDto {
  @IsObject()
  deviceInfo: {
    deviceId: string;
    userAgent: string;
    screenResolution: string;
    timestamp: number;
  };
}

export class DeviceRegistrationDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsObject()
  deviceInfo: {
    deviceId: string;
    userAgent: string;
    screenResolution: string;
    timestamp: number;
  };
}

export class AdminUnlockDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
