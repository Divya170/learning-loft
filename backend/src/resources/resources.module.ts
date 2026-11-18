import { Controller, Get, Injectable, Module, NotFoundException, Param, Query } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { AdminCrudController } from '../common/admin-crud.controller';
import { TONES } from '../common/constants';
import { ContentService } from '../common/content.service';
import { Trim } from '../common/validation';
import { DatabaseService, SqlParam } from '../database/database.service';
import { BaseEntity, likeParam, Repository } from '../database/repository';

export interface Resource extends BaseEntity {
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  author: string;
  publishedOn: string | null;
  readMinutes: number | null;
  cover: string;
  tone: string;
  featured: boolean;
  isPlaceholder: boolean;
  published: boolean;
}

/** Proposed categories from the brief — shown even when empty so families see the structure. */
export const PROPOSED_CATEGORIES = [
  'Study Resources',
  'Learning Guides',
  'Parent Information',
  'Educational Activities',
  'Student Development',
];

export class CreateResourceDto {
  @Trim() @IsString() @IsNotEmpty({ message: 'Title is required.' }) @MaxLength(160) title: string;
  @IsOptional() @Trim() @Matches(/^[a-z0-9-]*$/, { message: 'Slug may only contain lowercase letters, numbers and hyphens.' }) @MaxLength(90) slug?: string;
  @Trim() @IsString() @IsNotEmpty({ message: 'Category is required.' }) @MaxLength(80) category: string;
  @IsOptional() @Trim() @IsString() @MaxLength(400) summary?: string;
  @IsOptional() @IsString() @MaxLength(40000) body?: string;
  @IsOptional() @Trim() @IsString() @MaxLength(120) author?: string;
  @IsOptional() @ValidateIf((_, v) => v !== null && v !== '') @IsISO8601({ strict: true }, { message: 'Use a date like 2026-11-18.' })
  publishedOn?: string | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(1) @Max(120) readMinutes?: number | null;
  @IsOptional() @Trim() @IsString() @MaxLength(300) cover?: string;
  @IsOptional() @IsIn(TONES) tone?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() isPlaceholder?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
export class UpdateResourceDto extends PartialType(CreateResourceDto) {}

export class ResourceQueryDto {
  @IsOptional() @IsString() @MaxLength(100) q?: string;
  @IsOptional() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize?: number;
}

const ORDER = "COALESCE(published_on, substr(created_at, 1, 10)) DESC, id DESC";

@Injectable()
export class ResourcesService extends ContentService<Resource, CreateResourceDto, UpdateResourceDto> {
  protected readonly label = 'Resource';
  protected readonly repo: Repository<Resource>;
  protected searchColumns = ['title', 'category', 'author'];
  protected slugSource = 'title';
  protected adminOrder = ORDER;

  constructor(private readonly db: DatabaseService) {
    super();
    this.repo = new Repository<Resource>(db, 'resources', {
      slug: 'text', title: 'text', category: 'text', summary: 'text', body: 'text', author: 'text',
      publishedOn: 'text', readMinutes: 'int', cover: 'text', tone: 'text', featured: 'bool',
      isPlaceholder: 'bool', published: 'bool',
    });
  }

  /** Only one featured article at a time: featuring one un-features the rest. */
  create(dto: CreateResourceDto) {
    const created = super.create({ ...dto, publishedOn: dto.publishedOn || null });
    if (created.featured) this.unfeatureOthers(created.id);
    return created;
  }

  update(id: number, dto: UpdateResourceDto) {
    const patch = { ...dto };
    if (patch.publishedOn === '') patch.publishedOn = null;
    const updated = super.update(id, patch);
    if (dto.featured) this.unfeatureOthers(id);
    return updated;
  }

  private unfeatureOthers(id: number) {
    this.db.run('UPDATE resources SET featured = 0 WHERE id <> ? AND featured = 1', [id]);
  }

  search(query: ResourceQueryDto) {
    const where = ['published = 1'];
    const params: SqlParam[] = [];
    if (query.category) { where.push('category = ?'); params.push(query.category); }
    if (query.q?.trim()) { where.push(`title LIKE ? ESCAPE '\\'`); params.push(likeParam(query.q.trim())); }
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const total = this.repo.count(where, params);
    const items = this.repo
      .find({ where, params, orderBy: ORDER, limit: pageSize, offset: (page - 1) * pageSize })
      .map(({ body: _body, ...rest }) => rest);
    return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  }

  featured(): Resource | null {
    return (
      this.repo.findOne(['published = 1', 'featured = 1']) ??
      this.repo.find({ where: ['published = 1'], orderBy: ORDER, limit: 1 })[0] ??
      null
    );
  }

  categories(): { value: string; count: number }[] {
    const rows = this.db.all<{ value: string; count: number }>(
      `SELECT category AS value, COUNT(*) AS count FROM resources WHERE published = 1 AND category <> '' GROUP BY category`,
    );
    const map = new Map(rows.map((r) => [r.value, r.count]));
    const ordered = PROPOSED_CATEGORIES.map((value) => ({ value, count: map.get(value) ?? 0 }));
    const extra = rows.filter((r) => !PROPOSED_CATEGORIES.includes(r.value)).sort((a, b) => a.value.localeCompare(b.value));
    return [...ordered, ...extra];
  }

  bySlug(slug: string) {
    const resource = this.repo.findOne(['slug = ?', 'published = 1'], [slug]);
    if (!resource) throw new NotFoundException('Resource not found.');
    const related = this.repo
      .find({
        where: ['published = 1', 'id <> ?'],
        params: [resource.id, resource.category],
        orderBy: `CASE WHEN category = ? THEN 0 ELSE 1 END, ${ORDER}`,
        limit: 3,
      })
      .map(({ body: _body, ...rest }) => rest);
    return { resource, related };
  }
}

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resources: ResourcesService) {}

  @Get()
  search(@Query() query: ResourceQueryDto) {
    return this.resources.search(query);
  }

  @Get('featured')
  featured() {
    return { resource: this.resources.featured() };
  }

  @Get('categories')
  categories() {
    return this.resources.categories();
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.resources.bySlug(slug);
  }
}

const AdminResourcesController = AdminCrudController('resources', ResourcesService, CreateResourceDto, UpdateResourceDto);

@Module({
  controllers: [ResourcesController, AdminResourcesController],
  providers: [ResourcesService],
})
export class ResourcesModule {}
