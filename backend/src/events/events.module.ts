import { Controller, Get, Injectable, Module, NotFoundException, Param, Query } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, ValidateIf } from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { TONES } from '../common/constants';
import { ContentService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService, SqlParam } from '../database/database.service';
import { BaseEntity, Repository } from '../database/repository';

export interface LoftEvent extends BaseEntity {
  slug: string;
  title: string;
  category: string;
  description: string;
  startAt: string;
  timeLabel: string;
  location: string;
  registrationUrl: string;
  banner: string;
  tone: string;
  isPlaceholder: boolean;
  published: boolean;
}

export class CreateEventDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Event title is required.' }) @MaxLength(160) title: string;
  @IsOptional() @Trim() @Matches(/^[a-z0-9-]*$/, { message: 'Slug may only contain lowercase letters, numbers and hyphens.' }) @MaxLength(90) slug?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(6000) description?: string;
  @IsISO8601({}, { message: 'Enter a valid date and time.' }) startAt: string;
  @IsOptional() @Trim() @IsString() @MaxLength(80) timeLabel?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(200) location?: string;
  @IsOptional() @Trim() @ValidateIf((_, v) => v !== '') @IsUrl({ require_protocol: true }, { message: 'Registration link must be a full URL (https://…).' }) @MaxLength(400)
  registrationUrl?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(300) banner?: string;
  @IsOptional() @IsIn(TONES) tone?: string;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class EventQueryDto {
  @IsOptional() @IsIn(['upcoming', 'past']) when?: 'upcoming' | 'past';
  @IsOptional() @IsString() @MaxLength(80) category?: string;
}

@Injectable()
export class EventsService extends ContentService<LoftEvent, CreateEventDto, UpdateEventDto> {
  protected readonly label = 'Event';
  protected readonly repo: Repository<LoftEvent>;
  protected searchColumns = ['title', 'category', 'location'];
  protected slugSource = 'title';
  protected adminOrder = 'start_at DESC';

  constructor(private readonly db: DatabaseService) {
    super();
    this.repo = new Repository<LoftEvent>(db, 'events', {
      slug: 'text', title: 'text', category: 'text', description: 'text', startAt: 'text', timeLabel: 'text',
      location: 'text', registrationUrl: 'text', banner: 'text', tone: 'text', isPlaceholder: 'bool', published: 'bool',
    });
  }

  /** Dates are normalised to full UTC ISO strings so upcoming/past comparisons are reliable. */
  create(dto: CreateEventDto) {
    return super.create({ ...dto, startAt: new Date(dto.startAt).toISOString() });
  }

  update(id: number, dto: UpdateEventDto) {
    return super.update(id, dto.startAt ? { ...dto, startAt: new Date(dto.startAt).toISOString() } : dto);
  }

  private whenClause(when: 'upcoming' | 'past'): [string, string] {
    return when === 'past' ? ['start_at < ?', 'start_at DESC'] : ['start_at >= ?', 'start_at ASC'];
  }

  list(query: EventQueryDto) {
    const when = query.when ?? 'upcoming';
    const [clause, order] = this.whenClause(when);
    const where = ['published = 1', clause];
    const params: SqlParam[] = [new Date().toISOString()];
    if (query.category) { where.push('category = ?'); params.push(query.category); }
    return this.repo.find({ where, params, orderBy: order });
  }

  categories(when: 'upcoming' | 'past' = 'upcoming') {
    const [clause] = this.whenClause(when);
    return this.db.all<{ value: string; count: number }>(
      `SELECT category AS value, COUNT(*) AS count FROM events WHERE published = 1 AND category <> '' AND ${clause} GROUP BY category ORDER BY category`,
      [new Date().toISOString()],
    );
  }

  bySlug(slug: string) {
    const event = this.repo.findOne(['slug = ?', 'published = 1'], [slug]);
    if (!event) throw new NotFoundException('Event not found.');
    return { event, isPast: event.startAt < new Date().toISOString() };
  }

  upcomingCount(): number {
    return this.repo.count(['published = 1', 'start_at >= ?'], [new Date().toISOString()]);
  }
}

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(@Query() query: EventQueryDto) {
    return this.events.list(query);
  }

  @Get('categories')
  categories(@Query() query: EventQueryDto) {
    return this.events.categories(query.when);
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.events.bySlug(slug);
  }
}

const AdminEventsController = AdminCrudController('events', EventsService, CreateEventDto, UpdateEventDto);

@Module({
  controllers: [EventsController, AdminEventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
