import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';
import { GatewayService } from '../gateway/gateway.service';
import { CURRENCY, isValidPrice } from '../constants/currency.constants';

/**
 * OrderService handles all order-related operations
 * All prices are handled in Kazakhstani Tenge (KZT)
 */
@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private gatewayService: GatewayService,
  ) {}

  /**
   * Create a new order
   * @param createOrderDto - Order data including items with prices in KZT
   * @returns Created order with all prices in KZT
   */
  async create(createOrderDto: CreateOrderDto) {
    // Validate that all prices are valid KZT amounts
    if (!isValidPrice(createOrderDto.total)) {
      throw new NotFoundException('Invalid total amount in KZT');
    }

    for (const item of createOrderDto.items) {
      if (!isValidPrice(item.price)) {
        throw new NotFoundException(`Invalid price for item ${item.productId} in KZT`);
      }
    }

    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: createOrderDto.branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${createOrderDto.branchId} not found`);
    }

    // Verify user exists (only if userId is provided)
    if (createOrderDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createOrderDto.userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${createOrderDto.userId} not found`);
      }
    }

    const order = await this.prisma.order.create({
      data: {
        branch: {
          connect: {
            id: createOrderDto.branchId,
          },
        },
        // Only connect user if userId is provided
        ...(createOrderDto.userId && {
          user: {
            connect: {
              id: createOrderDto.userId,
            },
          },
        }),
        status: OrderStatus.PENDING,
        total: createOrderDto.total,
        customerName: createOrderDto.customerName, // Store customer name for tablet orders
        items: {
          create: createOrderDto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            updatedAt: new Date(),
            // Handle customizations if provided
            ...(item.customizations && item.customizations.length > 0 && {
              customizations: {
                create: item.customizations.map(customization => ({
                  productCustomizationId: customization.productCustomizationId,
                })),
              },
            }),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            customizations: {
              include: {
                productCustomization: true,
              },
            },
          },
        },
        user: true,
        branch: true,
      },
    });

    // Notify baristas about new order
    this.gatewayService.notifyNewOrder(order.branchId, order);

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            customizations: {
              include: {
                productCustomization: true,
              },
            },
          },
        },
        user: true,
        branch: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            customizations: {
              include: {
                productCustomization: true,
              },
            },
          },
        },
        user: true,
        branch: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updateData: any = {};

    // Update status if provided
    if (updateOrderDto.status !== undefined) {
      updateData.status = updateOrderDto.status;
    }

    // Update total if provided
    if (updateOrderDto.total !== undefined) {
      updateData.total = updateOrderDto.total;
    }

    // Update items if provided
    if (updateOrderDto.items && updateOrderDto.items.length > 0) {
      // Delete existing items
      await this.prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Create new items
      updateData.items = {
        create: updateOrderDto.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          updatedAt: new Date(),
        })),
      };

      // Recalculate total if items are updated but total is not provided
      if (updateOrderDto.total === undefined) {
        const newTotal = updateOrderDto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        updateData.total = newTotal;
      }
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
            customizations: {
              include: {
                productCustomization: true,
              },
            },
          },
        },
        user: true,
        branch: true,
      },
    });

    // Notify about order status update
    this.gatewayService.notifyOrderStatusUpdate(order.branchId, order.id, order.status);

    return order;
  }

  async remove(id: string) {
    // First check if the order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            customizations: true
          }
        }
      }
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Use a transaction to ensure all deletions happen atomically
    await this.prisma.$transaction(async (prisma) => {
      // First, delete all order item customizations for this order
      await prisma.orderItemCustomization.deleteMany({
        where: {
          orderItem: {
            orderId: id
          }
        }
      });

      // Then delete all order items for this order
      await prisma.orderItem.deleteMany({
        where: { orderId: id }
      });

      // Finally, delete the order itself
      await prisma.order.delete({
        where: { id },
      });
    });

    return { message: 'Order deleted successfully' };
  }

  async getProductsForOrder(items: Array<{ productId: string; quantity: number }>) {
    const productIds = items.map(item => item.productId);
    return await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });
  }

  /**
   * Calculate the total price for order items in KZT
   * @param items - Array of order items with prices in KZT
   * @returns Total amount in KZT
   */
  async calculateOrderTotal(items: Array<{ productId: string; quantity: number; price?: number }>) {
    if (items.some(item => item.price === undefined)) {
      const products = await this.getProductsForOrder(items);
      const total = items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        const price = item.price || product?.basePrice || 0;
        
        // Validate price is in valid KZT format
        if (!isValidPrice(price)) {
          throw new NotFoundException(`Invalid price for product ${item.productId}: ${price} KZT`);
        }
        
        return total + (price * item.quantity);
      }, 0);
      
      return total;
    }
    
    // Validate all provided prices
    for (const item of items) {
      if (!isValidPrice(item.price!)) {
        throw new NotFoundException(`Invalid price for product ${item.productId}: ${item.price} KZT`);
      }
    }
    
    return items.reduce((total, item) => total + (item.price! * item.quantity), 0);
  }

  // Branch-specific methods
  async getOrdersByBranch(branchId: string, status?: string) {
    const whereClause: any = { branchId };
    
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true
              }
            },
            customizations: {
              include: {
                productCustomization: true
              }
            }
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBranchOrderStats(branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's stats
    const todayStats = await this.prisma.order.aggregate({
      where: {
        branchId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      _count: true,
      _sum: {
        total: true
      }
    });

    // Get total stats
    const totalStats = await this.prisma.order.aggregate({
      where: { branchId },
      _count: true,
      _sum: {
        total: true
      }
    });

    // Get status breakdown
    const statusBreakdown = await this.prisma.order.groupBy({
      by: ['status'],
      where: { branchId },
      _count: true
    });

    return {
      today: {
        orders: todayStats._count,
        revenue: todayStats._sum.total || 0
      },
      total: {
        orders: totalStats._count,
        revenue: totalStats._sum.total || 0
      },
      statusBreakdown: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count
      }))
    };
  }
}