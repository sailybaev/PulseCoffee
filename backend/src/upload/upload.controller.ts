import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtOrRefreshGuard } from '../auth/guards/jwt-or-refresh.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtOrRefreshGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      filename: file.filename,
      url: this.uploadService.getFileUrl(file.filename),
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get('images')
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  async getAllImages() {
    return this.uploadService.getAllImages();
  }
}