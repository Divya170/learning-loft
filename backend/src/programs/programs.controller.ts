import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdminCrudController } from '../common/admin-crud.controller';
import { CreateProgramDto, ProgramQueryDto, UpdateProgramDto } from './programs.dto';
import { ProgramsService } from './programs.service';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  @Get()
  list(@Query() query: ProgramQueryDto) {
    return this.programs.list(query);
  }

  @Get('facets')
  facets() {
    return this.programs.facets();
  }

  @Get('options')
  options() {
    return this.programs.options();
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.programs.bySlug(slug);
  }
}

export const AdminProgramsController = AdminCrudController('programs', ProgramsService, CreateProgramDto, UpdateProgramDto);
