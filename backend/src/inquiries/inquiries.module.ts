import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Logger,
  Module,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  Equals,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { AdminGuard } from '../common/admin.guard';
import {
  CONTACT_METHODS,
  DUPLICATE_WINDOW_MS,
  INQUIRY_STATUSES,
  SUBMISSION_LIMIT,
  SUBMISSION_WINDOW_MS,
} from '../common/constants';
import { ClientIp, hashIp, makeReference, RateLimiter } from '../common/security';
import { Trim, validationException } from '../common/validation';
import { DatabaseService, SqlParam } from '../database/database.service';
import { BaseEntity, likeParam, Repository } from '../database/repository';
import { ProgramsModule } from '../programs/programs.module';
import { ProgramsService } from '../programs/programs.service';

export interface Inquiry extends BaseEntity {
  reference: string;
  parentName: string;
  email: string;
  phone: string;
  studentFirstName: string;
  studentAge: string;
  programId: number | null;
  programName: string;
  contactMethod: string;
  message: string;
  consent: boolean;
  status: string;
  notes: string;
  ipHash: string;
}

export class CreateInquiryDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Enter the parent or guardian name.' }) @MaxLength(120)
  parentName: string;

  @Trim() @IsEmail({}, { message: 'Enter a valid email, like name@example.com.' }) @MaxLength(160)
  email: string;

  @IsOptional() @Trim() @IsString() @MaxLength(30)
  phone?: string;

  @Trim() @IsString() @IsNotEmpty({ message: "Enter the student's first name." }) @MaxLength(60)
  studentFirstName: string;

  @Trim() @IsString() @IsNotEmpty({ message: "Enter the student's age or grade." }) @MaxLength(40)
  studentAge: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt({ message: 'Choose a program from the list.' })
  programId?: number | null;

  @IsIn(CONTACT_METHODS, { message: 'Choose how you would like us to contact you.' })
  contactMethod: string;

  @IsOptional() @Trim() @IsString() @MaxLength(1000, { message: 'Keep additional information under 1,000 characters.' })
  message?: string;

  @Equals(true, { message: 'Please agree to be contacted so we can respond.' })
  consent: boolean;

  /** Honeypot — real visitors never see or fill this field. */
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class InquiryAdminQueryDto {
  @IsOptional() @IsIn(INQUIRY_STATUSES) status?: string;
  @IsOptional() @IsString() @MaxLength(100) q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
}

export class UpdateInquiryDto {
  @IsOptional() @IsIn(INQUIRY_STATUSES, { message: 'Unknown status.' }) status?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(4000) notes?: string;
}

export interface SubmissionReceipt {
  reference: string;
  submittedAt: string;
  programName: string;
  contactMethod: string;
}

/** Shared phone rule for public forms. */
export function phoneError(phone: string | undefined, requiredFor?: string): string | undefined {
  const value = (phone ?? '').trim();
  if (!value) return requiredFor ? `Add a phone number so we can reach you by ${requiredFor.toLowerCase()}.` : undefined;
  if (!/^[0-9+().\-\s]+$/.test(value)) return 'Use digits and + ( ) - only.';
  const digits = value.replace(/\D/g, '').length;
  if (digits < 10 || digits > 15) return 'Enter a phone number with area code (10–15 digits).';
  return undefined;
}

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger('EnrollmentInquiries');
  readonly repo: Repository<Inquiry>;

  constructor(
    private readonly db: DatabaseService,
    private readonly programs: ProgramsService,
    private readonly limiter: RateLimiter,
  ) {
    this.repo = new Repository<Inquiry>(db, 'inquiries', {
      reference: 'text', parentName: 'text', email: 'text', phone: 'text', studentFirstName: 'text',
      studentAge: 'text', programId: 'int', programName: 'text', contactMethod: 'text', message: 'text',
      consent: 'bool', status: 'text', notes: 'text', ipHash: 'text',
    });
  }

  submit(dto: CreateInquiryDto, ip: string): SubmissionReceipt {
    const ipHash = hashIp(ip);
    const now = new Date();

    // Spam trap: pretend success, store nothing.
    if (dto.website?.trim()) {
      this.logger.warn('Honeypot triggered — inquiry discarded.');
      return { reference: makeReference('LL', now), submittedAt: now.toISOString(), programName: '', contactMethod: dto.contactMethod };
    }

    this.limiter.consume(`inquiry:${ipHash}`, SUBMISSION_LIMIT, SUBMISSION_WINDOW_MS);

    // Business rules that need more than field-level validation.
    const errors: Record<string, string> = {};
    const needsPhone = dto.contactMethod !== 'Email' ? dto.contactMethod : undefined;
    const pErr = phoneError(dto.phone, needsPhone);
    if (pErr) errors.phone = pErr;

    let programName = '';
    if (dto.programId != null) {
      const program = this.programs.findPublishedById(dto.programId);
      if (!program) errors.programId = 'That program is no longer available. Please choose another or "Not sure yet".';
      else programName = program.name;
    }
    if (Object.keys(errors).length) throw validationException(errors);

    // Duplicate-submission prevention.
    const since = new Date(now.getTime() - DUPLICATE_WINDOW_MS).toISOString();
    const dupe = this.db.get<{ reference: string }>(
      `SELECT reference FROM inquiries WHERE lower(email) = lower(?) AND lower(student_first_name) = lower(?) AND created_at >= ? ORDER BY id DESC LIMIT 1`,
      [dto.email, dto.studentFirstName, since],
    );
    if (dupe) {
      throw new ConflictException({
        statusCode: 409,
        message: 'We already received an inquiry for this student a few minutes ago — no need to send it again.',
        reference: dupe.reference,
      });
    }

    let reference = makeReference('LL', now);
    while (this.repo.findOne(['reference = ?'], [reference])) reference = makeReference('LL', now);

    const saved = this.repo.insert({
      reference,
      parentName: dto.parentName,
      email: dto.email.toLowerCase(),
      phone: dto.phone ?? '',
      studentFirstName: dto.studentFirstName,
      studentAge: dto.studentAge,
      programId: dto.programId ?? null,
      programName,
      contactMethod: dto.contactMethod,
      message: dto.message ?? '',
      consent: true,
      status: 'new',
      ipHash,
    });

    // Integration point: send a staff notification / family confirmation email here.
    this.logger.log(`New enrollment inquiry ${saved.reference}${programName ? ` for ${programName}` : ''}`);

    return { reference: saved.reference, submittedAt: saved.createdAt, programName, contactMethod: saved.contactMethod };
  }

  adminList(query: InquiryAdminQueryDto) {
    const where: string[] = [];
    const params: SqlParam[] = [];
    if (query.status) { where.push('status = ?'); params.push(query.status); }
    if (query.q?.trim()) {
      const like = likeParam(query.q.trim());
      where.push(`(reference LIKE ? ESCAPE '\\' OR parent_name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR student_first_name LIKE ? ESCAPE '\\' OR program_name LIKE ? ESCAPE '\\')`);
      params.push(like, like, like, like, like);
    }
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const total = this.repo.count(where, params);
    const items = this.repo.find({ where, params, orderBy: 'created_at DESC', limit: pageSize, offset: (page - 1) * pageSize });
    return { items: items.map(({ ipHash: _ip, ...rest }) => rest), total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  }

  adminGet(id: number) {
    const item = this.repo.findById(id);
    if (!item) throw new NotFoundException('Inquiry not found.');
    const { ipHash: _ip, ...rest } = item;
    return rest;
  }

  update(id: number, dto: UpdateInquiryDto) {
    this.adminGet(id);
    this.repo.update(id, { ...dto });
    return this.adminGet(id);
  }

  remove(id: number) {
    this.adminGet(id);
    this.repo.delete(id);
  }

  countByStatus(): Record<string, number> {
    const rows = this.db.all<{ status: string; n: number }>('SELECT status, COUNT(*) AS n FROM inquiries GROUP BY status');
    const out: Record<string, number> = { total: 0 };
    for (const s of INQUIRY_STATUSES) out[s] = 0;
    for (const r of rows) { out[r.status] = r.n; out.total += r.n; }
    return out;
  }
}

@Controller()
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post('inquiries')
  @HttpCode(201)
  submit(@Body() dto: CreateInquiryDto, @ClientIp() ip: string) {
    return this.inquiries.submit(dto, ip);
  }

  @Get('admin/inquiries')
  @UseGuards(AdminGuard)
  list(@Query() query: InquiryAdminQueryDto) {
    return this.inquiries.adminList(query);
  }

  @Get('admin/inquiries/:id')
  @UseGuards(AdminGuard)
  get(@Param('id', ParseIntPipe) id: number) {
    return this.inquiries.adminGet(id);
  }

  @Patch('admin/inquiries/:id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInquiryDto) {
    return this.inquiries.update(id, dto);
  }

  @Delete('admin/inquiries/:id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.inquiries.remove(id);
  }
}

@Module({
  imports: [ProgramsModule],
  controllers: [InquiriesController],
  providers: [InquiriesService, RateLimiter],
  exports: [InquiriesService],
})
export class InquiriesModule {}
