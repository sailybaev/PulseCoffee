import { Module } from '@nestjs/common';
import { DeviceController, AdminController } from './device.controller';
import { DeviceService } from './device.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeviceController, AdminController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
