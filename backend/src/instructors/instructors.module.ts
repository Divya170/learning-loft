import { Controller, Get, Injectable, Module, NotFoundException, Param } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { TONES } from '../common/constants';
import { ContentService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';

export interface Instructor extends BaseEntity {
  slug: string;
  name: string;
  position: string;
  qualification: string;
  shortBio: string;
  biography: string;
  experience: string;
  expertise: string;
  photo: string;
  tone: string;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export class CreateInstructorDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Name is required.' }) @MaxLength(120) name: string;
  @IsOptional() @Trim() @Matches(/^[a-z0-9-]*$/, { message: 'Slug may only contain lowercase letters, numbers and hyphens.' }) @MaxLength(80) slug?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(120) position?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(300) qualification?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(500) shortBio?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(5000) biography?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(500) experience?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(500) expertise?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(300) photo?: string;
  @IsOptional() @IsIn(TONES) tone?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateInstructorDto extends PartialType(CreateInstructorDto) {}

const ORDER = 'sort_order ASC, id ASC';

@Injectable()
export class InstructorsService extends ContentService<Instructor, CreateInstructorDto, UpdateInstructorDto> {
  protected readonly label = 'Instructor';
  protected readonly repo: Repository<Instructor>;
  protected searchColumns = ['name', 'position', 'qualification'];
  protected slugSource = 'name';
  protected adminOrder = ORDER;

  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Instructor>(db, 'instructors', {
      slug: 'text', name: 'text', position: 'text', qualification: 'text', shortBio: 'text', biography: 'text',
      experience: 'text', expertise: 'text', photo: 'text', tone: 'text', sortOrder: 'int',
      isPlaceholder: 'bool', published: 'bool',
    });
  }

  list(limit?: number): Instructor[] {
    return this.repo.find({ where: ['published = 1'], orderBy: ORDER, limit });
  }

  bySlug(slug: string): Instructor {
    const item = this.repo.findOne(['slug = ?', 'published = 1'], [slug]);
    if (!item) throw new NotFoundException('Instructor not found.');
    return item;
  }
}

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructors: InstructorsService) {}

  @Get()
  list() {
    return this.instructors.list();
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.instructors.bySlug(slug);
  }
}

const AdminInstructorsController = AdminCrudController('instructors', InstructorsService, CreateInstructorDto, UpdateInstructorDto);

@Module({
  controllers: [InstructorsController, AdminInstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService],
})
export class InstructorsModule {}
