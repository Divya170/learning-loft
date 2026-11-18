import { DatabaseService, SqlParam } from './database.service';

export type ColType = 'text' | 'int' | 'bool' | 'json';
/** camelCase property → column type. Column names are the snake_case form of the property. */
export type ColumnSchema = Record<string, ColType>;

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface FindOptions {
  where?: string[];
  params?: SqlParam[];
  orderBy?: string; // trusted SQL from code — never user input
  limit?: number;
  offset?: number;
}

export const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
export const NOW_SQL = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

/** Escapes LIKE wildcards in user input. Use with `ESCAPE '\\'`. */
export const likeParam = (q: string) => `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || 'item';
}

/** Generic table access: maps rows ↔ entities, handles booleans/JSON and timestamps. */
export class Repository<T extends BaseEntity> {
  constructor(
    protected readonly db: DatabaseService,
    readonly table: string,
    readonly schema: ColumnSchema,
  ) {}

  map(row: Record<string, unknown>): T {
    const out: Record<string, unknown> = { id: row.id, createdAt: row.created_at, updatedAt: row.updated_at };
    for (const [prop, type] of Object.entries(this.schema)) {
      const v = row[toSnake(prop)];
      if (type === 'bool') out[prop] = v === 1 || v === true;
      else if (type === 'json') {
        try {
          out[prop] = typeof v === 'string' ? JSON.parse(v) : v ?? null;
        } catch {
          out[prop] = null;
        }
      } else if (type === 'int') out[prop] = v === null || v === undefined ? null : Number(v);
      else out[prop] = v === undefined ? '' : v; // keep NULL for nullable columns
    }
    return out as T;
  }

  private toColumns(data: Record<string, unknown>): [string[], SqlParam[]] {
    const cols: string[] = [];
    const vals: SqlParam[] = [];
    for (const [prop, type] of Object.entries(this.schema)) {
      if (!(prop in data) || data[prop] === undefined) continue;
      const v = data[prop];
      cols.push(toSnake(prop));
      if (type === 'bool') vals.push(v ? 1 : 0);
      else if (type === 'json') vals.push(JSON.stringify(v ?? null));
      else if (type === 'int') vals.push(v === null ? null : Number(v));
      else vals.push(v === null ? null : String(v));
    }
    return [cols, vals];
  }

  find(opts: FindOptions = {}): T[] {
    let sql = `SELECT * FROM ${this.table}`;
    if (opts.where?.length) sql += ` WHERE ${opts.where.join(' AND ')}`;
    sql += ` ORDER BY ${opts.orderBy ?? 'id DESC'}`;
    const params = [...(opts.params ?? [])];
    if (opts.limit !== undefined) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(opts.limit, opts.offset ?? 0);
    }
    return this.db.all(sql, params).map((r) => this.map(r));
  }

  count(where: string[] = [], params: SqlParam[] = []): number {
    const sql = `SELECT COUNT(*) AS n FROM ${this.table}${where.length ? ` WHERE ${where.join(' AND ')}` : ''}`;
    return this.db.get<{ n: number }>(sql, params)?.n ?? 0;
  }

  findOne(where: string[], params: SqlParam[] = []): T | undefined {
    return this.find({ where, params, limit: 1 })[0];
  }

  findById(id: number): T | undefined {
    return this.findOne(['id = ?'], [id]);
  }

  insert(data: Record<string, unknown>): T {
    const [cols, vals] = this.toColumns(data);
    const res = this.db.run(
      `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
      vals,
    );
    return this.findById(Number(res.lastInsertRowid)) as T;
  }

  update(id: number, data: Record<string, unknown>): T | undefined {
    const [cols, vals] = this.toColumns(data);
    const sets = [...cols.map((c) => `${c} = ?`), `updated_at = ${NOW_SQL}`];
    this.db.run(`UPDATE ${this.table} SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
    return this.findById(id);
  }

  delete(id: number): boolean {
    return this.db.run(`DELETE FROM ${this.table} WHERE id = ?`, [id]).changes > 0;
  }

  /** Returns a slug based on `base` that no other row uses. */
  uniqueSlug(base: string, excludeId?: number): string {
    const root = slugify(base);
    let candidate = root;
    for (let i = 2; ; i++) {
      const clash = this.db.get(
        `SELECT id FROM ${this.table} WHERE slug = ?${excludeId ? ' AND id <> ?' : ''}`,
        excludeId ? [candidate, excludeId] : [candidate],
      );
      if (!clash) return candidate;
      candidate = `${root}-${i}`;
    }
  }
}
