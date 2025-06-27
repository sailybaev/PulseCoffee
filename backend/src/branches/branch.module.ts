import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { PublicBranchController } from './public-branch.controller';
import { BranchService } from './branch.service';

@Module({
  controllers: [BranchController, PublicBranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}