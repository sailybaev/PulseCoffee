import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CreateUserDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    createUser: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        phoneNumber: '+1234567890',
        password: 'Test123!',
        name: 'Test User',
      };

      const expectedResponse = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: {
          id: '1',
          phoneNumber: registerDto.phoneNumber,
          name: registerDto.name,
          role: UserRole.CLIENT,
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto, mockResponse);

      expect(result).toEqual({
        accessToken: expectedResponse.accessToken,
        user: expectedResponse.user,
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expectedResponse.refreshToken,
        expect.any(Object),
      );
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        phoneNumber: '+1234567890',
        password: 'Test123!',
      };

      const expectedResponse = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: {
          id: '1',
          phoneNumber: loginDto.phoneNumber,
          name: 'Test User',
          role: UserRole.CLIENT,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto, mockResponse);

      expect(result).toEqual({
        accessToken: expectedResponse.accessToken,
        user: expectedResponse.user,
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expectedResponse.refreshToken,
        expect.any(Object),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockRequest = {
        cookies: {
          refreshToken: 'test-refresh-token',
        },
      };

      const expectedResponse = {
        accessToken: 'new-test-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshTokens.mockResolvedValue(expectedResponse);

      const result = await controller.refreshTokens(mockRequest, mockResponse);

      expect(result).toEqual({
        accessToken: expectedResponse.accessToken,
      });
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'test-refresh-token',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expectedResponse.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );
    });

    it('should handle missing refresh token in cookies', async () => {
      const mockRequest = {
        cookies: {},
        user: {
          sub: '1',
        },
      };

      mockAuthService.refreshTokens.mockRejectedValue(new UnauthorizedException('Access denied'));

      await expect(controller.refreshTokens(mockRequest, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle invalid refresh token', async () => {
      const mockRequest = {
        cookies: {
          refreshToken: 'invalid-token',
        },
        user: {
          sub: '1',
          refreshToken: 'invalid-token',
        },
      };

      mockAuthService.refreshTokens.mockRejectedValue(new UnauthorizedException('Access denied'));

      await expect(controller.refreshTokens(mockRequest, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const mockRequest = {
        user: {
          id: '1',
          sub: '1',
        },
      };

      const expectedResponse = {
        message: 'Logged out successfully',
      };

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockRequest, mockResponse);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.logout).toHaveBeenCalledWith(mockRequest.user.id);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        phoneNumber: '+1234567890',
        password: 'Test123!',
        name: 'Test Barista',
        role: UserRole.BARISTA,
      };

      const mockRequest = {
        user: {
          id: '1',
          sub: '1',
        },
      };

      const expectedResponse = {
        id: '2',
        phoneNumber: createUserDto.phoneNumber,
        name: createUserDto.name,
        role: createUserDto.role,
      };

      mockAuthService.createUser.mockResolvedValue(expectedResponse);

      const result = await controller.createUser(createUserDto, mockRequest);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.createUser).toHaveBeenCalledWith(
        createUserDto,
        mockRequest.user.id,
      );
    });
  });
}); 