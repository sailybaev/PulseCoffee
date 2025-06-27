import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductToBranchDto } from './dto/add-product-to-branch.dto';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { ProductCategory } from './enums/product-category.enum';
import { CustomizationType } from './enums/customization-type.enum';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByCategory: jest.fn(),
    update: jest.fn(),
    addToBranch: jest.fn(),
    addCustomization: jest.fn(),
    getProductCustomizations: jest.fn(),
    getCustomizationsByType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Coffee',
        description: 'A delicious test coffee',
        price: 4.99,
        category: ProductCategory.COFFEE,
        imageUrl: 'https://example.com/coffee.jpg',
      };

      const expectedResponse = {
        id: '1',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(expectedResponse);
      expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should return all products when no category is provided', async () => {
      const expectedResponse = [
        {
          id: '1',
          name: 'Test Coffee',
          description: 'A delicious test coffee',
          price: 4.99,
          category: ProductCategory.COFFEE,
          imageUrl: 'https://example.com/coffee.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResponse);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });

    it('should return products by category when category is provided', async () => {
      const category = ProductCategory.COFFEE;
      const expectedResponse = [
        {
          id: '1',
          name: 'Test Coffee',
          description: 'A delicious test coffee',
          price: 4.99,
          category: ProductCategory.COFFEE,
          imageUrl: 'https://example.com/coffee.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductService.findByCategory.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(category);

      expect(result).toEqual(expectedResponse);
      expect(mockProductService.findByCategory).toHaveBeenCalledWith(category);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = '1';
      const updateProductDto: UpdateProductDto = {
        price: 5.99,
      };

      const expectedResponse = {
        id: productId,
        name: 'Test Coffee',
        description: 'A delicious test coffee',
        price: 5.99,
        category: ProductCategory.COFFEE,
        imageUrl: 'https://example.com/coffee.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(productId, updateProductDto);

      expect(result).toEqual(expectedResponse);
      expect(mockProductService.update).toHaveBeenCalledWith(productId, updateProductDto);
    });
  });

  describe('addToBranch', () => {
    it('should add a product to a branch', async () => {
      const addProductToBranchDto: AddProductToBranchDto = {
        productId: '1',
        branchId: '1',
        stock: 100,
      };

      const expectedResponse = {
        id: '1',
        ...addProductToBranchDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductService.addToBranch.mockResolvedValue(expectedResponse);

      const result = await controller.addToBranch(addProductToBranchDto);

      expect(result).toEqual(expectedResponse);
      expect(mockProductService.addToBranch).toHaveBeenCalledWith(addProductToBranchDto);
    });
  });

  describe('addCustomization', () => {
    it('should add a customization to a product', async () => {
      const productId = '1';
      const createCustomizationDto: CreateCustomizationDto = {
        name: 'Extra Shot',
        type: CustomizationType.ADD_ON,
        price: 1.00,
      };

      const expectedResponse = {
        id: '1',
        productId,
        ...createCustomizationDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductService.addCustomization.mockResolvedValue(expectedResponse);

      const result = await controller.addCustomization(productId, createCustomizationDto);

      expect(result).toEqual(expectedResponse);
      expect(mockProductService.addCustomization).toHaveBeenCalledWith({
        ...createCustomizationDto,
        productId,
      });
    });
  });

  describe('getProductCustomizations', () => {
    it('should return all customizations when no type is provided', async () => {
      const productId = '1';
      const expectedResponse = [
        {
          id: '1',
          productId,
          name: 'Extra Shot',
          type: CustomizationType.ADD_ON,
          price: 1.00,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductService.getProductCustomizations.mockResolvedValue(expectedResponse);

      const result = await controller.getProductCustomizations(productId);

      expect(result).toEqual(expectedResponse);
      expect(mockProductService.getProductCustomizations).toHaveBeenCalledWith(productId);
    });

    it('should return customizations by type when type is provided', async () => {
      const productId = '1';
      const type = CustomizationType.ADD_ON;
      const expectedResponse = [
        {
          id: '1',
          productId,
          name: 'Extra Shot',
          type: CustomizationType.ADD_ON,
          price: 1.00,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductService.getCustomizationsByType.mockResolvedValue(expectedResponse);

      const result = await controller.getProductCustomizations(productId, type);

      expect(result).toEqual(expectedResponse);
      expect(mockProductService.getCustomizationsByType).toHaveBeenCalledWith(productId, type);
    });
  });
}); 