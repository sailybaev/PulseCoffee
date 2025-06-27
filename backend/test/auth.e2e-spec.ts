import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await app.close();
  });

  describe('Refresh Token Flow', () => {
    const testUser = {
      name: 'Test User',
      phoneNumber: '+1234567890',
      password: 'testPassword123',
      role: UserRole.CLIENT,
    };

    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await prismaService.user.create({
        data: {
          name: testUser.name,
          phoneNumber: testUser.phoneNumber,
          passwordHash: hashedPassword,
          role: testUser.role,
        },
      });

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phoneNumber: testUser.phoneNumber,
          password: testUser.password,
        });

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    it('should successfully refresh tokens', async () => {
      // Wait for 1 second to ensure token is different
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken=');
    });

    it('should fail to refresh with invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401);

      expect(response.body.message).toBe('Access denied');
    });

    it('should fail to refresh without refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);

      expect(response.body.message).toBe('Access denied');
    });

    it('should invalidate refresh token after logout', async () => {
      // First logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Try to refresh with the old refresh token
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(401);

      expect(response.body.message).toBe('Access denied');
    });
  });
}); 