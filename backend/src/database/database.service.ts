import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';

export type SqlParam = string | number | null | bigint | Buffer;

/**
 * Thin wrapper around better-sqlite3. On start-up it applies database/schema.sql and,
 * for a brand-new database, database/seed.sql.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private connection?: Database.Database;

  onModuleInit() {
    const dbPath = resolve(process.env.DATABASE_PATH ?? join(process.cwd(), '..', 'database', 'app.sqlite'));
    const sqlDir = dirname(dbPath);
    mkdirSync(sqlDir, { recursive: true });

    this.connection = new Database(dbPath);
    this.connection.pragma('journal_mode = WAL');
    this.connection.pragma('foreign_keys = ON');
    this.connection.pragma('busy_timeout = 5000');

    const schemaFile = join(sqlDir, 'schema.sql');
    if (!existsSync(schemaFile)) throw new Error(`schema.sql not found next to the database (${schemaFile})`);
    this.connection.exec(readFileSync(schemaFile, 'utf8'));

    const fresh = this.get<{ n: number }>('SELECT COUNT(*) AS n FROM settings')?.n === 0;
    const seedFile = join(sqlDir, 'seed.sql');
    if (fresh && existsSync(seedFile)) {
      this.connection.exec(readFileSync(seedFile, 'utf8'));
      this.logger.log('Seeded a new database with starter (placeholder) content.');
    }
    this.logger.log(`SQLite ready: ${dbPath}`);
  }

  onModuleDestroy() {
    this.connection?.close();
  }

  private get db(): Database.Database {
    if (!this.connection) throw new Error('Database not initialised');
    return this.connection;
  }

  all<T = Record<string, unknown>>(sql: string, params: SqlParam[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  get<T = Record<string, unknown>>(sql: string, params: SqlParam[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  run(sql: string, params: SqlParam[] = []) {
    return this.db.prepare(sql).run(...params);
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }
}
