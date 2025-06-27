import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BranchService } from './branch.service';
import { ValidateBranchDto } from './dto/validate-branch.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('branches-public')
export class PublicBranchController {
  constructor(private readonly branchService: BranchService) {}

  // Public endpoints for tablet setup and validation
  @Public()
  @Get()
  getActiveBranches() {
    return this.branchService.getActiveBranches();
  }

  @Public()
  @Post(':id/validate')
  validateBranch(@Param('id') id: string, @Body() validateDto: ValidateBranchDto) {
    return this.branchService.validateBranch(id, validateDto);
  }
}
