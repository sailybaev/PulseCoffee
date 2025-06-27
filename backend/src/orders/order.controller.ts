import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Delete, Put, Query } from '@nestjs/common';
import { JwtOrRefreshGuard } from '../auth/guards/jwt-or-refresh.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Public endpoint for tablet orders (no authentication required)
  @Public()
  @Post('public')
  async createPublicOrder(@Body() body: any) {
    console.log('📋 Creating public order with body:', JSON.stringify(body, null, 2));
    
    // No authentication required for tablet orders
    console.log('🔍 Getting products for order...');
    const products = await this.orderService.getProductsForOrder(body.items);
    console.log('✅ Found products:', products.map(p => ({ id: p.id, name: p.name })));
    let total = 0;
    const items = body.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      // Calculate price including customizations
      let itemPrice = product.basePrice;
      if (item.customizations && item.customizations.length > 0) {
        // Add customization costs - use the provided price from frontend
        itemPrice = item.price / item.quantity;
      }
      
      const itemTotal = itemPrice * item.quantity;
      total += itemTotal;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        customizations: item.customizations || []
      };
    });

    const createOrderDto: CreateOrderDto = {
      userId: null, // Anonymous order
      branchId: body.branchId,
      items: items,
      total: total,
      customerName: body.customerName || 'Guest'
    };

    console.log('💾 Creating order with DTO:', JSON.stringify(createOrderDto, null, 2));
    const order = await this.orderService.create(createOrderDto);
    console.log('✅ Order created successfully:', order.id);
    
    // Return order with additional info for tablet
    return {
      id: order.id,
      orderNumber: `#${order.id.slice(-6).toUpperCase()}`, // Last 6 chars as order number
      status: order.status,
      total: order.total,
      estimatedTime: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
      createdAt: order.createdAt,
      customerName: body.customerName || 'Guest'
    };
  }

  // Protected endpoints (require authentication)
  @UseGuards(JwtOrRefreshGuard, RolesGuard)

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async create(@Body() body: any, @Request() req) {
    // Calculate total by fetching product prices
    const products = await this.orderService.getProductsForOrder(body.items);
    let total = 0;
    const items = body.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      const itemTotal = product.basePrice * item.quantity;
      total += itemTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.basePrice
      };
    });

    const createOrderDto: CreateOrderDto = {
      userId: req.user.id,
      branchId: body.branchId,
      items: items,
      total: total
    };

    return this.orderService.create(createOrderDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BARISTA, UserRole.CLIENT)
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  async fullUpdate(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    // For PUT requests, we expect all required fields
    if (updateOrderDto.items) {
      // Recalculate total if items are provided but total is not
      if (!updateOrderDto.total) {
        updateOrderDto.total = await this.orderService.calculateOrderTotal(updateOrderDto.items);
      }
    }
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  // Branch-specific endpoints
  @Get('branch')
  @Public()
  async getOrdersByBranch(@Query('branch') branchId: string, @Query('status') status?: string) {
    return this.orderService.getOrdersByBranch(branchId, status);
  }

  @Get('branch/:branchId/stats')
  @UseGuards(JwtOrRefreshGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  async getBranchOrderStats(@Param('branchId') branchId: string) {
    return this.orderService.getBranchOrderStats(branchId);
  }

  // Alternative branch-specific endpoint with path parameter (for barista app compatibility)
  @Get('branch/:branchId')
  @UseGuards(JwtOrRefreshGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  async getOrdersByBranchPath(@Param('branchId') branchId: string, @Query('status') status?: string) {
    return this.orderService.getOrdersByBranch(branchId, status);
  }
}