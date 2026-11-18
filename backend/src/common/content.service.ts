import { NotFoundException } from '@nestjs/common';
import { BaseEntity, likeParam, Repository } from '../database/repository';

/** Contract the generic admin CRUD controller relies on. */
export interface AdminCrudService<C, U> {
  adminList(q?: string): unknown[];
  adminGet(id: number): unknown;
  create(dto: C): unknown;
  update(id: number, dto: U): unknown;
  remove(id: number): void;
}

/**
 * Shared admin behaviour for content tables: search, get-or-404, create with a unique slug,
 * partial update, delete. Subclasses add public read methods and domain rules via `beforeSave`.
 */
export abstract class ContentService<T extends BaseEntity, C extends object, U extends object>
  implements AdminCrudService<C, U>
{
  protected abstract readonly repo: Repository<T>;
  protected abstract readonly label: string;
  /** Columns searched by the admin `q` filter. */
  protected searchColumns: string[] = [];
  /** Property used to derive a slug (tables without slugs leave this undefined). */
  protected slugSource?: string;
  protected adminOrder = 'id DESC';

  adminList(q?: string): T[] {
    const term = q?.trim();
    if (!term || !this.searchColumns.length) return this.repo.find({ orderBy: this.adminOrder });
    const where = [`(${this.searchColumns.map((c) => `${c} LIKE ? ESCAPE '\\'`).join(' OR ')})`];
    return this.repo.find({ where, params: this.searchColumns.map(() => likeParam(term)), orderBy: this.adminOrder });
  }

  adminGet(id: number): T {
    const item = this.repo.findById(id);
    if (!item) throw new NotFoundException(`${this.label} not found.`);
    return item;
  }

  create(dto: C): T {
    const data = { ...(dto as Record<string, unknown>) };
    this.beforeSave(data, undefined);
    if (this.slugSource) {
      const base = (data.slug as string) || (data[this.slugSource] as string) || this.label;
      data.slug = this.repo.uniqueSlug(base);
    }
    return this.repo.insert(data);
  }

  update(id: number, dto: U): T {
    const existing = this.adminGet(id);
    const data = { ...(dto as Record<string, unknown>) };
    this.beforeSave({ ...existing, ...data }, existing);
    if (this.slugSource && typeof data.slug === 'string' && data.slug) {
      data.slug = this.repo.uniqueSlug(data.slug, id);
    } else {
      delete data.slug; // an empty slug keeps the current one
    }
    return this.repo.update(id, data) as T;
  }

  remove(id: number): void {
    this.adminGet(id);
    this.repo.delete(id);
  }

  /** Hook for domain rules; throw to reject. `merged` is the record as it would be saved. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected beforeSave(merged: Record<string, unknown>, existing?: T): void {}
}
