import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentService } from '../common/content.service';
import { DatabaseService, SqlParam } from '../database/database.service';
import { BaseEntity, likeParam, Repository } from '../database/repository';
import { CreateProgramDto, ProgramQueryDto, UpdateProgramDto } from './programs.dto';

export interface Program extends BaseEntity {
  slug: string;
  name: string;
  category: string;
  ageGroup: string;
  level: string;
  summary: string;
  introduction: string;
  objectives: string[];
  activities: string;
  image: string;
  tone: string;
  featured: boolean;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Facet {
  value: string;
  count: number;
}

const ORDER = 'sort_order ASC, id ASC';
const FACET_COLUMNS = { category: 'category', ageGroup: 'age_group', level: 'level' } as const;

@Injectable()
export class ProgramsService extends ContentService<Program, CreateProgramDto, UpdateProgramDto> {
  protected readonly label = 'Program';
  protected readonly repo: Repository<Program>;
  protected searchColumns = ['name', 'category', 'summary'];
  protected slugSource = 'name';
  protected adminOrder = ORDER;

  constructor(private readonly db: DatabaseService) {
    super();
    this.repo = new Repository<Program>(db, 'programs', {
      slug: 'text', name: 'text', category: 'text', ageGroup: 'text', level: 'text', summary: 'text',
      introduction: 'text', objectives: 'json', activities: 'text', image: 'text', tone: 'text',
      featured: 'bool', sortOrder: 'int', isPlaceholder: 'bool', published: 'bool',
    });
  }

  /** Published programs, filtered server-side. */
  list(query: ProgramQueryDto): Program[] {
    const where = ['published = 1'];
    const params: SqlParam[] = [];
    if (query.category) { where.push('category = ?'); params.push(query.category); }
    if (query.ageGroup) { where.push('age_group = ?'); params.push(query.ageGroup); }
    if (query.level) { where.push('level = ?'); params.push(query.level); }
    if (query.featured !== undefined) { where.push('featured = ?'); params.push(query.featured ? 1 : 0); }
    if (query.q?.trim()) {
      where.push(`(name LIKE ? ESCAPE '\\' OR summary LIKE ? ESCAPE '\\')`);
      params.push(likeParam(query.q.trim()), likeParam(query.q.trim()));
    }
    return this.repo.find({ where, params, orderBy: ORDER });
  }

  /** Filter options with counts — only values that actually exist in published programs. */
  facets(): Record<keyof typeof FACET_COLUMNS, Facet[]> & { total: number } {
    const out = { total: this.repo.count(['published = 1']) } as Record<keyof typeof FACET_COLUMNS, Facet[]> & { total: number };
    for (const [key, col] of Object.entries(FACET_COLUMNS) as [keyof typeof FACET_COLUMNS, string][]) {
      out[key] = this.db.all<Facet>(
        `SELECT ${col} AS value, COUNT(*) AS count FROM programs WHERE published = 1 AND ${col} <> '' GROUP BY ${col} ORDER BY ${col}`,
      );
    }
    return out;
  }

  bySlug(slug: string): { program: Program; related: Program[] } {
    const program = this.repo.findOne(['slug = ?', 'published = 1'], [slug]);
    if (!program) throw new NotFoundException('Program not found.');
    const related = this.repo.find({
      where: ['published = 1', 'id <> ?', 'category = ?'],
      params: [program.id, program.category],
      orderBy: ORDER,
      limit: 3,
    });
    return { program, related };
  }

  findPublishedById(id: number): Program | undefined {
    return this.repo.findOne(['id = ?', 'published = 1'], [id]);
  }

  /** Lightweight list for the enrollment form's program select. */
  options(): { id: number; name: string; slug: string }[] {
    return this.list({}).map(({ id, name, slug }) => ({ id, name, slug }));
  }
}
