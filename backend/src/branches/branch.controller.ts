import { Controller, Get, Post, Body, UseGuards, Delete, Param, Put } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ValidateBranchDto } from './dto/validate-branch.dto';
import { JwtOrRefreshGuard } from '../auth/guards/jwt-or-refresh.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('branches')
@UseGuards(JwtOrRefreshGuard, RolesGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.BARISTA, UserRole.CLIENT)
  findAll() {
    return this.branchService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BARISTA)
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.branchService.delete(id);
  }

  // Public endpoints for tablet validation
  @Public()
  @Post(':id/validate')
  validateBranch(@Param('id') id: string, @Body() validateDto: ValidateBranchDto) {
    return this.branchService.validateBranch(id, validateDto);
  }

  @Public()
  @Get('public')
  getActiveBranches() {
    return this.branchService.getActiveBranches();
  }
}