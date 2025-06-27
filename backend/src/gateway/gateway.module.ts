import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {} 