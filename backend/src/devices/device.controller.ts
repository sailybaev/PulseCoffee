import { Controller, Post, Body, Get, Query, UseGuards, Param } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceRegistrationDto, AdminUnlockDto } from '../branches/dto/validate-branch.dto';
import { JwtOrRefreshGuard } from '../auth/guards/jwt-or-refresh.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // Public endpoint for device registration
  @Public()
  @Post('register')
  async registerDevice(@Body() registrationDto: DeviceRegistrationDto) {
    return this.deviceService.registerDevice(registrationDto);
  }

  // Public endpoint for device validation
  @Public()
  @Post('validate')
  async validateDevice(@Body() body: { deviceId: string; branchId: string }) {
    return this.deviceService.validateDevice(body.deviceId, body.branchId);
  }

  // Admin endpoints (protected)
  @Get()
  @UseGuards(JwtOrRefreshGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllDevices() {
    return this.deviceService.getAllDevices();
  }

  @Get('branch/:branchId')
  @UseGuards(JwtOrRefreshGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  async getDevicesByBranch(@Param('branchId') branchId: string) {
    return this.deviceService.getDevicesByBranch(branchId);
  }
}

@Controller('admin')
export class AdminController {
  constructor(private readonly deviceService: DeviceService) {}

  // Public endpoint for emergency unlock
  @Public()
  @Post('unlock')
  async adminUnlock(@Body() unlockDto: AdminUnlockDto) {
    return this.deviceService.adminUnlock(unlockDto);
  }
}
