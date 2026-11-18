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
import { Equals, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { AdminGuard } from '../common/admin.guard';
import {
  CONTACT_TOPICS,
  DUPLICATE_WINDOW_MS,
  MESSAGE_STATUSES,
  SUBMISSION_LIMIT,
  SUBMISSION_WINDOW_MS,
} from '../common/constants';
import { ClientIp, hashIp, makeReference, RateLimiter } from '../common/security';
import { Trim, validationException } from '../common/validation';
import { DatabaseService, SqlParam } from '../database/database.service';
import { BaseEntity, likeParam, Repository } from '../database/repository';
import { phoneError } from '../inquiries/inquiries.module';

export interface ContactMessage extends BaseEntity {
  reference: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  consent: boolean;
  status: string;
  notes: string;
  ipHash: string;
}

export class CreateContactDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Enter your full name.' }) @MaxLength(120) name: string;
  @Trim() @IsEmail({}, { message: 'Enter a valid email, like name@example.com.' }) @MaxLength(160) email: string;
  @IsOptional() @Trim() @IsString() @MaxLength(30) phone?: string;
  @IsIn(CONTACT_TOPICS, { message: 'Choose an inquiry type.' }) inquiryType: string;
  @Trim() @IsString() @MinLength(10, { message: 'Write a message of at least 10 characters.' }) @MaxLength(1500, { message: 'Keep your message under 1,500 characters.' })
  message: string;
  @Equals(true, { message: 'Please agree to be contacted so we can reply.' }) consent: boolean;
  /** Honeypot. */
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}

export class MessageAdminQueryDto {
  @IsOptional() @IsIn(MESSAGE_STATUSES) status?: string;
  @IsOptional() @IsString() @MaxLength(100) q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
}

export class UpdateMessageDto {
  @IsOptional() @IsIn(MESSAGE_STATUSES, { message: 'Unknown status.' }) status?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(4000) notes?: string;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger('ContactMessages');
  readonly repo: Repository<ContactMessage>;

  constructor(private readonly db: DatabaseService, private readonly limiter: RateLimiter) {
    this.repo = new Repository<ContactMessage>(db, 'contact_messages', {
      reference: 'text', name: 'text', email: 'text', phone: 'text', inquiryType: 'text', message: 'text',
      consent: 'bool', status: 'text', notes: 'text', ipHash: 'text',
    });
  }

  submit(dto: CreateContactDto, ip: string) {
    const now = new Date();
    if (dto.website?.trim()) {
      this.logger.warn('Honeypot triggered — message discarded.');
      return { reference: makeReference('LM', now), submittedAt: now.toISOString(), inquiryType: dto.inquiryType };
    }
    const ipHash = hashIp(ip);
    this.limiter.consume(`contact:${ipHash}`, SUBMISSION_LIMIT, SUBMISSION_WINDOW_MS);

    const pErr = phoneError(dto.phone);
    if (pErr) throw validationException({ phone: pErr });

    const since = new Date(now.getTime() - DUPLICATE_WINDOW_MS).toISOString();
    const dupe = this.db.get<{ reference: string }>(
      'SELECT reference FROM contact_messages WHERE lower(email) = lower(?) AND message = ? AND created_at >= ? LIMIT 1',
      [dto.email, dto.message, since],
    );
    if (dupe) {
      throw new ConflictException({ statusCode: 409, message: 'We already received this message — our team will reply soon.', reference: dupe.reference });
    }

    let reference = makeReference('LM', now);
    while (this.repo.findOne(['reference = ?'], [reference])) reference = makeReference('LM', now);

    const saved = this.repo.insert({
      reference, name: dto.name, email: dto.email.toLowerCase(), phone: dto.phone ?? '',
      inquiryType: dto.inquiryType, message: dto.message, consent: true, status: 'new', ipHash,
    });
    // Integration point: forward to the center's inbox here.
    this.logger.log(`New contact message ${saved.reference} (${saved.inquiryType})`);
    return { reference: saved.reference, submittedAt: saved.createdAt, inquiryType: saved.inquiryType };
  }

  adminList(query: MessageAdminQueryDto) {
    const where: string[] = [];
    const params: SqlParam[] = [];
    if (query.status) { where.push('status = ?'); params.push(query.status); }
    if (query.q?.trim()) {
      const like = likeParam(query.q.trim());
      where.push(`(reference LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\')`);
      params.push(like, like, like, like);
    }
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const total = this.repo.count(where, params);
    const items = this.repo.find({ where, params, orderBy: 'created_at DESC', limit: pageSize, offset: (page - 1) * pageSize });
    return { items: items.map(({ ipHash: _ip, ...rest }) => rest), total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  }

  adminGet(id: number) {
    const item = this.repo.findById(id);
    if (!item) throw new NotFoundException('Message not found.');
    const { ipHash: _ip, ...rest } = item;
    return rest;
  }

  update(id: number, dto: UpdateMessageDto) {
    this.adminGet(id);
    this.repo.update(id, { ...dto });
    return this.adminGet(id);
  }

  remove(id: number) {
    this.adminGet(id);
    this.repo.delete(id);
  }

  countByStatus(): Record<string, number> {
    const rows = this.db.all<{ status: string; n: number }>('SELECT status, COUNT(*) AS n FROM contact_messages GROUP BY status');
    const out: Record<string, number> = { total: 0 };
    for (const s of MESSAGE_STATUSES) out[s] = 0;
    for (const r of rows) { out[r.status] = r.n; out.total += r.n; }
    return out;
  }
}

@Controller()
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post('contact')
  @HttpCode(201)
  submit(@Body() dto: CreateContactDto, @ClientIp() ip: string) {
    return this.contact.submit(dto, ip);
  }

  @Get('admin/messages')
  @UseGuards(AdminGuard)
  list(@Query() query: MessageAdminQueryDto) {
    return this.contact.adminList(query);
  }

  @Get('admin/messages/:id')
  @UseGuards(AdminGuard)
  get(@Param('id', ParseIntPipe) id: number) {
    return this.contact.adminGet(id);
  }

  @Patch('admin/messages/:id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMessageDto) {
    return this.contact.update(id, dto);
  }

  @Delete('admin/messages/:id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.contact.remove(id);
  }
}

@Module({
  controllers: [ContactController],
  providers: [ContactService, RateLimiter],
  exports: [ContactService],
})
export class ContactModule {}
