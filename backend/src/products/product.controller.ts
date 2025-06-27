import { Controller, Get, Post, Body, UseGuards, Param, Query, Patch, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtOrRefreshGuard } from '../auth/guards/jwt-or-refresh.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AddProductToBranchDto } from './dto/add-product-to-branch.dto';
import { ProductCategory } from './enums/product-category.enum';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { CustomizationType } from './enums/customization-type.enum';
import { UploadService } from '../upload/upload.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly uploadService: UploadService,
  ) {}

  // Public endpoints for tablet (no authentication required)
  @Public()
  @Get('public')
  findAllPublic(@Query('category') category?: ProductCategory) {
    // Public endpoint for tablet - no authentication required
    if (category) {
      return this.productService.findByCategory(category);
    }
    return this.productService.findAll();
  }

  @Public()
  @Get('public/:id')
  findOnePublic(@Param('id') id: string) {
    // Public endpoint for tablet - no authentication required
    return this.productService.findOne(id);
  }

  @Public()
  @Get('public/:id/customizations')
  getProductCustomizationsPublic(
    @Param('id') productId: string,
    @Query('type') type?: CustomizationType,
  ) {
    // Public endpoint for tablet - no authentication required
    if (type) {
      return this.productService.getCustomizationsByType(productId, type);
    }
    return this.productService.getProductCustomizations(productId);
  }

  // Test public endpoint
  @Public()
  @Get('test-public')
  testPublic() {
    return { message: 'Public endpoint working!', timestamp: new Date() };
  }

  // Protected endpoints (require authentication)
  @UseGuards(JwtOrRefreshGuard, RolesGuard)

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Post('with-image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async createWithImage(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    console.log('Creating product with image...');
    console.log('DTO:', createProductDto);
    console.log('Image file:', image ? { 
      filename: image.filename, 
      originalname: image.originalname,
      mimetype: image.mimetype,
      size: image.size 
    } : 'No image');
    
    if (image) {
      // Validate the uploaded image
      this.uploadService.validateImageFile(image);
      // Set the image URL using the generated filename from multer
      createProductDto.imageUrl = this.uploadService.getFileUrl(image.filename);
      console.log('Generated image URL:', createProductDto.imageUrl);
    }
    
    const result = await this.productService.create(createProductDto);
    console.log('Product created:', result);
    return result;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.BARISTA, UserRole.CLIENT)
  findAll(@Query('category') category?: ProductCategory) {
    if (category) {
      return this.productService.findByCategory(category);
    }
    return this.productService.findAll();
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Patch(':id/image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File
  ) {
    if (image) {
      this.uploadService.validateImageFile(image);
      const imageUrl = this.uploadService.getFileUrl(image.filename);
      return this.productService.update(id, { imageUrl });
    }
  }

  @Post('branch')
  @Roles(UserRole.ADMIN)
  addToBranch(@Body() addProductToBranchDto: AddProductToBranchDto) {
    return this.productService.addToBranch(addProductToBranchDto);
  }

  @Post(':id/customizations')
  @Roles(UserRole.ADMIN)
  addCustomization(
    @Param('id') productId: string,
    @Body() createCustomizationDto: CreateCustomizationDto,
  ) {
    return this.productService.addCustomization({
      ...createCustomizationDto,
      productId,
    });
  }

  @Get(':id/customizations')
  @Roles(UserRole.ADMIN, UserRole.BARISTA, UserRole.CLIENT)
  getProductCustomizations(
    @Param('id') productId: string,
    @Query('type') type?: CustomizationType,
  ) {
    if (type) {
      return this.productService.getCustomizationsByType(productId, type);
    }
    return this.productService.getProductCustomizations(productId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BARISTA, UserRole.CLIENT)
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id);
  }

  @Get('branch-assignments')
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  getBranchAssignments() {
    return this.productService.getBranchAssignments();
  }

  @Post('assign-to-branch')
  @Roles(UserRole.ADMIN)
  assignProductToBranch(@Body() dto: { productId: string; branchId: string; quantity: number }) {
    return this.productService.assignProductToBranch(dto.productId, dto.branchId, dto.quantity);
  }

  @Post('bulk-assign-to-branch')
  @Roles(UserRole.ADMIN)
  bulkAssignProductsToBranch(@Body() dto: { branchId: string; quantity: number }) {
    return this.productService.bulkAssignProductsToBranch(dto.branchId, dto.quantity);
  }

  @Patch('branch-assignment/:id')
  @Roles(UserRole.ADMIN)
  updateBranchAssignment(@Param('id') id: string, @Body() dto: { quantity: number }) {
    return this.productService.updateBranchAssignment(id, dto.quantity);
  }

  @Delete('branch-assignment/:id')
  @Roles(UserRole.ADMIN)
  deleteBranchAssignment(@Param('id') id: string) {
    return this.productService.deleteBranchAssignment(id);
  }

  @Get(':id/can-delete')
  @Roles(UserRole.ADMIN)
  canDelete(@Param('id') id: string) {
    return this.productService.canDelete(id);
  }
}