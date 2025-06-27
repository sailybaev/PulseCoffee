import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './products/product.module';
import { OrderModule } from './orders/order.module';
import { BranchModule } from './branches/branch.module';
import { DeviceModule } from './devices/device.module';
import { UploadModule } from './upload/upload.module';
import { GatewayModule } from './gateway/gateway.module';
import { StaticModule } from './static/static.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtOrRefreshGuard } from './auth/guards/jwt-or-refresh.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    ProductModule,
    OrderModule,
    BranchModule,
    DeviceModule,
    UploadModule,
    GatewayModule,
    StaticModule,
  ],
  controllers: [AppController],
  providers: [AppService , {
      provide: APP_GUARD,
      useClass: JwtOrRefreshGuard,
    },
  ],
})
export class AppModule {}
