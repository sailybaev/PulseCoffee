import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AddProductToBranchDto } from './dto/add-product-to-branch.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { ProductCategory } from './enums/product-category.enum';
import { CustomizationType } from './enums/customization-type.enum';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        category: createProductDto.category || ProductCategory.COFFEE,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        ProductInBranch: {
          include: {
            Branch: true,
          },
        },
      },
    });
  }

  async findByCategory(category: ProductCategory) {
    return this.prisma.product.findMany({
      where: {
        category,
      },
      include: {
        ProductInBranch: {
          include: {
            Branch: true,
          },
        },
      },
    });
  }

  async addToBranch(addProductToBranchDto: AddProductToBranchDto) {
    const { productId, branchId, price } = addProductToBranchDto;

    const existingProductInBranch = await this.prisma.productInBranch.findUnique({
      where: {
        productId_branchId: {
          productId,
          branchId,
        },
      },
    });

    if (existingProductInBranch) {
      throw new ConflictException('Product already exists in this branch');
    }

    return this.prisma.productInBranch.create({
      data: {
        id: `${productId}-${branchId}`,
        productId,
        branchId,
        price,
        updatedAt: new Date(),
      },
      include: {
        Product: true,
        Branch: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        ProductInBranch: {
          include: {
            Branch: true,
          },
        },
      },
    });
  }

  async addCustomization(createCustomizationDto: CreateCustomizationDto) {
    const { productId, type, name } = createCustomizationDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const existingCustomization = await this.prisma.productCustomization.findUnique({
      where: {
        productId_type_name: {
          productId,
          type,
          name,
        },
      },
    });

    if (existingCustomization) {
      throw new ConflictException(`Customization ${name} of type ${type} already exists for this product`);
    }

    return this.prisma.productCustomization.create({
      data: createCustomizationDto,
      include: {
        product: true,
      },
    });
  }

  async getProductCustomizations(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        customizations: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product.customizations;
  }

  async getCustomizationsByType(productId: string, type: CustomizationType) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        customizations: {
          where: {
            type,
            isAvailable: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product.customizations;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        ProductInBranch: {
          include: {
            Branch: true,
          },
        },
        customizations: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async delete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        ProductInBranch: true,
        customizations: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if product has associated order items
    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        `Cannot delete product "${product.name}" because it has ${product.orderItems.length} associated order item(s). Products with order history cannot be deleted to maintain data integrity.`
      );
    }

    // Use transaction to delete all related data
    return this.prisma.$transaction(async (prisma) => {
      // Delete product customizations first
      await prisma.productCustomization.deleteMany({
        where: { productId: id },
      });

      // Delete product-branch associations
      await prisma.productInBranch.deleteMany({
        where: { productId: id },
      });

      // Finally delete the product
      return prisma.product.delete({
        where: { id },
      });
    });
  }

  async getBranchAssignments() {
    return this.prisma.productInBranch.findMany({
      include: {
        Product: true,
        Branch: true,
      },
      orderBy: [
        { Branch: { name: 'asc' } },
        { Product: { name: 'asc' } },
      ],
    });
  }

  async assignProductToBranch(productId: string, branchId: string, quantity: number) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    // Create or update the assignment
    return this.prisma.productInBranch.upsert({
      where: {
        productId_branchId: {
          productId,
          branchId,
        },
      },
      update: {
        isAvailable: true,
        updatedAt: new Date(),
      },
      create: {
        id: `${productId}-${branchId}`,
        productId,
        branchId,
        price: product.basePrice, // Use base price as default
        isAvailable: true,
        updatedAt: new Date(),
      },
      include: {
        Product: true,
        Branch: true,
      },
    });
  }

  async bulkAssignProductsToBranch(branchId: string, quantity: number) {
    // Check if branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    // Get all products
    const products = await this.prisma.product.findMany();

    // Create assignments for all products
    const assignments = await Promise.all(
      products.map(product =>
        this.prisma.productInBranch.upsert({
          where: {
            productId_branchId: {
              productId: product.id,
              branchId,
            },
          },
          update: {
            isAvailable: true,
            updatedAt: new Date(),
          },
          create: {
            id: `${product.id}-${branchId}`,
            productId: product.id,
            branchId,
            price: product.basePrice,
            isAvailable: true,
            updatedAt: new Date(),
          },
          include: {
            Product: true,
            Branch: true,
          },
        })
      )
    );

    return assignments;
  }

  async updateBranchAssignment(id: string, quantity: number) {
    const assignment = await this.prisma.productInBranch.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Product branch assignment with ID ${id} not found`);
    }

    return this.prisma.productInBranch.update({
      where: { id },
      data: {
        isAvailable: quantity > 0,
        updatedAt: new Date(),
      },
      include: {
        Product: true,
        Branch: true,
      },
    });
  }

  async deleteBranchAssignment(id: string) {
    const assignment = await this.prisma.productInBranch.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Product branch assignment with ID ${id} not found`);
    }

    return this.prisma.productInBranch.delete({
      where: { id },
    });
  }

  async canDelete(id: string): Promise<{ canDelete: boolean; reason?: string; orderItemCount?: number }> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.orderItems.length > 0) {
      return {
        canDelete: false,
        reason: `Product has ${product.orderItems.length} associated order item(s)`,
        orderItemCount: product.orderItems.length,
      };
    }

    return { canDelete: true };
  }
}