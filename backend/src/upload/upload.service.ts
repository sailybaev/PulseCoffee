import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  getFileUrl(filename: string): string {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    return `${baseUrl}/uploads/${filename}`;
  }

  validateImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }

    return true;
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join('./uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getAllImages(): Promise<Array<{ filename: string; url: string; size: number; mtime: Date }>> {
    try {
      const uploadsDir = path.join('./uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        return [];
      }

      const files = fs.readdirSync(uploadsDir);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      
      const images = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .map(file => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            url: this.getFileUrl(file),
            size: stats.size,
            mtime: stats.mtime,
          };
        })
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Sort by newest first

      return images;
    } catch (error) {
      throw new BadRequestException('Failed to read images directory');
    }
  }
}