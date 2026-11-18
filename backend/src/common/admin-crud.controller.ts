import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Type,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminCrudService } from './content.service';
import { createValidationPipe } from './validation';

/**
 * Builds a guarded `/api/admin/<path>` controller with list/get/create/update/delete.
 * DTO classes are passed explicitly so validation still works through the generic class.
 */
export function AdminCrudController<C extends object, U extends object>(
  path: string,
  serviceToken: Type<AdminCrudService<C, U>>,
  createDto: Type<C>,
  updateDto: Type<U>,
) {
  @Controller(`admin/${path}`)
  @UseGuards(AdminGuard)
  class AdminCrud {
    constructor(@Inject(serviceToken) readonly service: AdminCrudService<C, U>) {}

    @Get()
    list(@Query('q') q?: string) {
      return this.service.adminList(q);
    }

    @Get(':id')
    get(@Param('id', ParseIntPipe) id: number) {
      return this.service.adminGet(id);
    }

    @Post()
    create(@Body(createValidationPipe({ expectedType: createDto })) dto: C) {
      return this.service.create(dto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body(createValidationPipe({ expectedType: updateDto })) dto: U) {
      return this.service.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id', ParseIntPipe) id: number) {
      this.service.remove(id);
    }
  }
  return AdminCrud;
}
