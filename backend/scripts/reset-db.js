/* Re-creates the SQLite database from database/schema.sql + database/seed.sql.
 * Usage: npm run db:reset   (from /backend)  — destroys all data in the file. */
const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch { /* optional */ }

const dbPath = path.resolve(process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'database', 'app.sqlite'));
const dir = path.dirname(dbPath);
for (const f of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) if (fs.existsSync(f)) fs.rmSync(f);

const db = new Database(dbPath);
db.exec(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
db.exec(fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8'));
db.close();
console.log(`Database reset: ${dbPath}`);
