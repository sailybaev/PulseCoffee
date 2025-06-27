import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ValidateBranchDto } from './dto/validate-branch.dto';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: createBranchDto,
    });
  }

  async findAll() {
    return this.prisma.branch.findMany({
      include: {
        ProductInBranch: {
          include: {
            Product: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        ProductInBranch: {
          include: {
            Product: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Latest 10 orders
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  async delete(id: string) {
    // First check if the branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        User: true,
        orders: true,
        ProductInBranch: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Check for foreign key constraints
    const constraints: string[] = [];
    if (branch.User.length > 0) {
      constraints.push(`${branch.User.length} user(s) assigned to this branch`);
    }
    if (branch.orders.length > 0) {
      constraints.push(`${branch.orders.length} order(s) from this branch`);
    }
    if (branch.ProductInBranch.length > 0) {
      constraints.push(`${branch.ProductInBranch.length} product(s) assigned to this branch`);
    }

    if (constraints.length > 0) {
      throw new BadRequestException(
        `Cannot delete branch because it has: ${constraints.join(', ')}. Please remove these associations first.`
      );
    }

    // If no constraints, proceed with deletion
    return this.prisma.branch.delete({
      where: { id },
    });
  }

  // Tablet-specific methods
  async validateBranch(id: string, validateDto: ValidateBranchDto) {
    const branch = await this.prisma.branch.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true
      }
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return { valid: true, branch };
  }

  async getActiveBranches() {
    return this.prisma.branch.findMany({
      select: {
        id: true,
        name: true,
        address: true
      },
      orderBy: { name: 'asc' }
    });
  }
}