import { Test, TestingModule } from '@nestjs/testing';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BranchController', () => {
  let controller: BranchController;
  let branchService: BranchService;

  const mockBranchService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchController],
      providers: [
        {
          provide: BranchService,
          useValue: mockBranchService,
        },
      ],
    }).compile();

    controller = module.get<BranchController>(BranchController);
    branchService = module.get<BranchService>(BranchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new branch', async () => {
      const createBranchDto: CreateBranchDto = {
        name: 'Test Branch',
        address: '123 Test St',
      };

      const expectedResponse = {
        id: '1',
        ...createBranchDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBranchService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createBranchDto);

      expect(result).toEqual(expectedResponse);
      expect(mockBranchService.create).toHaveBeenCalledWith(createBranchDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of branches', async () => {
      const expectedResponse = [
        {
          id: '1',
          name: 'Test Branch',
          address: '123 Test St',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockBranchService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResponse);
      expect(mockBranchService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single branch', async () => {
      const branchId = '1';
      const expectedResponse = {
        id: branchId,
        name: 'Test Branch',
        address: '123 Test St',
        createdAt: new Date(),
        updatedAt: new Date(),
        ProductInBranch: [],
        User: [],
        orders: [],
      };

      mockBranchService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(branchId);

      expect(result).toEqual(expectedResponse);
      expect(mockBranchService.findOne).toHaveBeenCalledWith(branchId);
    });
  });

  describe('update', () => {
    it('should update a branch', async () => {
      const branchId = '1';
      const updateBranchDto: UpdateBranchDto = {
        name: 'Updated Branch Name',
      };

      const expectedResponse = {
        id: branchId,
        name: 'Updated Branch Name',
        address: '123 Test St',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBranchService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(branchId, updateBranchDto);

      expect(result).toEqual(expectedResponse);
      expect(mockBranchService.update).toHaveBeenCalledWith(branchId, updateBranchDto);
    });
  });

  describe('delete', () => {
    it('should delete a branch', async () => {
      const branchId = '1';
      const expectedResponse = {
        id: branchId,
        name: 'Test Branch',
        address: '123 Test St',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBranchService.delete.mockResolvedValue(expectedResponse);

      const result = await controller.delete(branchId);

      expect(result).toEqual(expectedResponse);
      expect(mockBranchService.delete).toHaveBeenCalledWith(branchId);
    });
  });
});