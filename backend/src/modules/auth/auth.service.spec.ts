import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '@/common/prisma/prisma.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    establishment: {
      create: jest.fn(),
    },
    agentConfig: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed-password';
      const mockUser = {
        id: 'user-id',
        email,
        password: hashedPassword,
        name: 'Test User',
        active: true,
        establishment: { id: 'est-id' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { establishment: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        active: mockUser.active,
        establishment: mockUser.establishment,
      });
    });

    it('should throw UnauthorizedException for user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashed-password';
      const mockUser = {
        id: 'user-id',
        email,
        password: hashedPassword,
        name: 'Test User',
        active: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('login', () => {
    it('should return access token for valid user', async () => {
      const mockLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        establishment: { id: 'est-id' },
      };
      const mockToken = 'mock-jwt-token';

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser as any);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockLoginDto);

      expect(service.validateUser).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          establishment: mockUser.establishment,
        },
      });
    });
  });

  describe('register', () => {
    it('should create new user and establishment', async () => {
      const registerDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        establishmentName: 'New Restaurant',
      };
      const hashedPassword = 'hashed-password';
      const mockEstablishment = {
        id: 'est-id',
        name: registerDto.establishmentName,
      };
      const mockUser = {
        id: 'user-id',
        name: registerDto.name,
        email: registerDto.email,
        role: 'ADMIN',
        establishment: mockEstablishment,
      };
      const mockToken = 'mock-jwt-token';

      // Mock no existing user first
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      jest.spyOn(service, 'login').mockResolvedValue({
        access_token: mockToken,
        user: mockUser as any,
      });

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        establishmentName: 'Restaurant',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User already exists',
      );
    });
  });
});