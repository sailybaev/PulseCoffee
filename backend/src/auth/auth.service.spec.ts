import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('refreshTokens', () => {
    const mockUser = {
      id: '1',
      phoneNumber: '+1234567890',
      role: UserRole.CLIENT,
      refreshToken: 'hashed-refresh-token',
    };

    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    beforeEach(() => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.signAsync
        .mockImplementation((payload, options) => {
          if (options.expiresIn === '15m') {
            return Promise.resolve(mockTokens.accessToken);
          }
          return Promise.resolve(mockTokens.refreshToken);
        });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, refreshToken: 'new-hashed-token' });
    });

    it('should successfully refresh tokens', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      
      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          refreshToken: {
            not: null
          }
        }
      });
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no users found', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      await expect(service.refreshTokens('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.refreshTokens('invalid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user has no refresh token', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([{
        ...mockUser,
        refreshToken: null,
      }]);

      await expect(service.refreshTokens('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
}); 