import { BadRequestException, Controller, Get, Injectable, Module } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { ContentService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';

const ORDER = 'sort_order ASC, id ASC';

/* ───────────── FAQs ───────────── */
export interface Faq extends BaseEntity {
  question: string;
  answer: string;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}
export class CreateFaqDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Question is required.' }) @MaxLength(240) question: string;
  @Trim() @IsString() @IsNotEmpty({ message: 'Answer is required.' }) @MaxLength(3000) answer: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateFaqDto extends PartialType(CreateFaqDto) {}

@Injectable()
export class FaqsService extends ContentService<Faq, CreateFaqDto, UpdateFaqDto> {
  protected readonly label = 'FAQ';
  protected readonly repo: Repository<Faq>;
  protected searchColumns = ['question', 'answer'];
  protected adminOrder = ORDER;
  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Faq>(db, 'faqs', {
      question: 'text', answer: 'text', sortOrder: 'int', isPlaceholder: 'bool', published: 'bool',
    });
  }
  list() {
    return this.repo.find({ where: ['published = 1'], orderBy: ORDER });
  }
}

/* ───────────── Registration requirements ───────────── */
export interface Requirement extends BaseEntity {
  title: string;
  detail: string;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}
export class CreateRequirementDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Title is required.' }) @MaxLength(200) title: string;
  @IsOptional() @Trim() @IsString() @MaxLength(1000) detail?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateRequirementDto extends PartialType(CreateRequirementDto) {}

@Injectable()
export class RequirementsService extends ContentService<Requirement, CreateRequirementDto, UpdateRequirementDto> {
  protected readonly label = 'Requirement';
  protected readonly repo: Repository<Requirement>;
  protected searchColumns = ['title', 'detail'];
  protected adminOrder = ORDER;
  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Requirement>(db, 'requirements', {
      title: 'text', detail: 'text', sortOrder: 'int', isPlaceholder: 'bool', published: 'bool',
    });
  }
  list() {
    return this.repo.find({ where: ['published = 1'], orderBy: ORDER });
  }
}

/* ───────────── Testimonials ───────────── */
export interface Testimonial extends BaseEntity {
  quote: string;
  attribution: string;
  consentConfirmed: boolean;
  sortOrder: number;
  published: boolean;
}
export class CreateTestimonialDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Quote is required.' }) @MaxLength(1200) quote: string;
  @Trim() @IsString() @IsNotEmpty({ message: 'Attribution is required.' }) @MaxLength(160) attribution: string;
  @IsOptional() @IsBoolean() consentConfirmed?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}

@Injectable()
export class TestimonialsService extends ContentService<Testimonial, CreateTestimonialDto, UpdateTestimonialDto> {
  protected readonly label = 'Testimonial';
  protected readonly repo: Repository<Testimonial>;
  protected searchColumns = ['quote', 'attribution'];
  protected adminOrder = ORDER;
  constructor(db: DatabaseService) {
    super();
    this.repo = new Repository<Testimonial>(db, 'testimonials', {
      quote: 'text', attribution: 'text', consentConfirmed: 'bool', sortOrder: 'int', published: 'bool',
    });
  }

  /** Brief rule: only authentic, permission-granted testimonials may be shown. */
  protected beforeSave(merged: Record<string, unknown>) {
    if (merged.published && !merged.consentConfirmed) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'A testimonial can only be published after the family has given permission.',
        errors: { consentConfirmed: 'Confirm permission before publishing.' },
      });
    }
  }

  list() {
    return this.repo.find({ where: ['published = 1', 'consent_confirmed = 1'], orderBy: ORDER });
  }
}

/* ───────────── Public controllers ───────────── */
@Controller()
export class SiteContentController {
  constructor(
    private readonly faqs: FaqsService,
    private readonly requirements: RequirementsService,
    private readonly testimonials: TestimonialsService,
  ) {}

  @Get('faqs')
  listFaqs() {
    return this.faqs.list();
  }

  @Get('requirements')
  listRequirements() {
    return this.requirements.list();
  }

  @Get('testimonials')
  listTestimonials() {
    return this.testimonials.list().map(({ id, quote, attribution }) => ({ id, quote, attribution }));
  }
}

const AdminFaqsController = AdminCrudController('faqs', FaqsService, CreateFaqDto, UpdateFaqDto);
const AdminRequirementsController = AdminCrudController('requirements', RequirementsService, CreateRequirementDto, UpdateRequirementDto);
const AdminTestimonialsController = AdminCrudController('testimonials', TestimonialsService, CreateTestimonialDto, UpdateTestimonialDto);

@Module({
  controllers: [SiteContentController, AdminFaqsController, AdminRequirementsController, AdminTestimonialsController],
  providers: [FaqsService, RequirementsService, TestimonialsService],
})
export class SiteContentModule {}
