import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceRegistrationDto, AdminUnlockDto } from '../branches/dto/validate-branch.dto';

@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}

  async registerDevice(registrationDto: DeviceRegistrationDto) {
    // Check if branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: registrationDto.branchId }
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Register or update device using upsert
    try {
      const device = await this.prisma.device.upsert({
        where: { deviceId: registrationDto.deviceId },
        create: {
          deviceId: registrationDto.deviceId,
          branchId: registrationDto.branchId,
          deviceInfo: registrationDto.deviceInfo,
        },
        update: {
          branchId: registrationDto.branchId,
          deviceInfo: registrationDto.deviceInfo,
          lastSeen: new Date(),
        },
      });

      return { success: true, deviceId: device.deviceId, branchId: device.branchId };
    } catch (error) {
      console.error('Device registration error:', error);
      throw new Error('Failed to register device');
    }
  }

  async validateDevice(deviceId: string, branchId: string) {
    const device = await this.prisma.device.findFirst({
      where: { 
        deviceId: deviceId,
        branchId: branchId
      }
    });

    if (!device) {
      return { valid: false, message: 'Device not registered for this branch' };
    }

    // Update last seen
    await this.prisma.device.update({
      where: { id: device.id },
      data: { lastSeen: new Date() }
    });

    return { valid: true, device };
  }

  async adminUnlock(unlockDto: AdminUnlockDto) {
    const adminPassword = process.env.ADMIN_UNLOCK_PASSWORD || 'admin123';
    
    if (unlockDto.password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin password');
    }

    // Log the unlock attempt
    await this.prisma.adminAction.create({
      data: {
        action: 'TABLET_UNLOCK',
        deviceId: unlockDto.deviceId,
      }
    });

    return { success: true, message: 'Device unlocked successfully' };
  }

  async getDevicesByBranch(branchId: string) {
    const devices = await this.prisma.device.findMany({
      where: { branchId },
      select: {
        deviceId: true,
        deviceInfo: true,
        lastSeen: true,
        createdAt: true,
      },
      orderBy: { lastSeen: 'desc' }
    });

    return devices;
  }

  async getAllDevices() {
    const devices = await this.prisma.device.findMany({
      select: {
        deviceId: true,
        deviceInfo: true,
        lastSeen: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { lastSeen: 'desc' }
    });

    return devices.map(device => ({
      device_id: device.deviceId,
      device_info: device.deviceInfo,
      last_seen: device.lastSeen,
      created_at: device.createdAt,
      branch_id: device.branch.id,
      branch_name: device.branch.name,
    }));
  }
}
