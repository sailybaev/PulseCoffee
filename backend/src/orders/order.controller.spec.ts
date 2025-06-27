import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  const mockOrderService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: '1',
        branchId: '1',
        items: [
          {
            productId: '1',
            quantity: 2,
            price: 5.99,
          },
        ],
        total: 11.98,
      };

      const expectedResponse = {
        id: '1',
        ...createOrderDto,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createOrderDto);

      expect(result).toEqual(expectedResponse);
      expect(mockOrderService.create).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const expectedResponse = [
        {
          id: '1',
          userId: '1',
          branchId: '1',
          items: [
            {
              productId: '1',
              quantity: 2,
              price: 5.99,
            },
          ],
          total: 11.98,
          status: OrderStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockOrderService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResponse);
      expect(mockOrderService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const orderId = '1';
      const expectedResponse = {
        id: orderId,
        userId: '1',
        branchId: '1',
        items: [
          {
            productId: '1',
            quantity: 2,
            price: 5.99,
          },
        ],
        total: 11.98,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(orderId);

      expect(result).toEqual(expectedResponse);
      expect(mockOrderService.findOne).toHaveBeenCalledWith(orderId);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const orderId = '1';
      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.COMPLETED,
      };

      const expectedResponse = {
        id: orderId,
        userId: '1',
        branchId: '1',
        items: [
          {
            productId: '1',
            quantity: 2,
            price: 5.99,
          },
        ],
        total: 11.98,
        status: OrderStatus.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(orderId, updateOrderDto);

      expect(result).toEqual(expectedResponse);
      expect(mockOrderService.update).toHaveBeenCalledWith(orderId, updateOrderDto);
    });
  });
}); 