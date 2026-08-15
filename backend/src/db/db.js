const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let usePostgres = false;
let pgPool = null;
let sqliteDb = null;

const databaseUrl = process.env.DATABASE_URL;

// Initialize SQLite database with self-healing column repair
const initSqlite = () => {
  if (!sqliteDb) {
    const { DatabaseSync } = require('node:sqlite');
    const dbPath = path.join(__dirname, '../../inventrack.db');
    sqliteDb = new DatabaseSync(dbPath);
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    console.log(`[InvenTrack DB] Active database: SQLite (${dbPath})`);

    // Self-healing check for legacy column name mismatch from earlier migrations
    try {
      const columns = sqliteDb.prepare("PRAGMA table_info(stock_movements)").all();
      const hasTextCol = columns.some((c) => c.name === 'TEXT');
      const hasMovementTypeCol = columns.some((c) => c.name === 'movement_type');
      if (hasTextCol && !hasMovementTypeCol) {
        sqliteDb.exec("ALTER TABLE stock_movements RENAME COLUMN TEXT TO movement_type;");
        console.log("[InvenTrack DB] Repaired stock_movements table schema: RENAME COLUMN TEXT -> movement_type");
      }
    } catch (e) {
      // Table will be created by migrate.js
    }
  }
  return sqliteDb;
};

// Check if PostgreSQL URL is provided
if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  usePostgres = true;
  pgPool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' || databaseUrl.includes('render.com') ? { rejectUnauthorized: false } : false
  });
  console.log('[InvenTrack DB] Active database: Managed PostgreSQL');
} else {
  initSqlite();
}

// Translate PostgreSQL SQL syntax to SQLite if running in SQLite mode
const adaptSqlForSqlite = (sql) => {
  let adapted = sql
    .replace(/\$([0-9]+)/g, '?') // Replace $1, $2 with ?
    .replace(/\bILIKE\b/gi, 'LIKE') // Replace ILIKE with LIKE
    .replace(/\bTIMESTAMPTZ\b/gi, 'DATETIME')
    .replace(/\bSERIAL PRIMARY KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/DO \$\$ BEGIN[\s\S]*?END \$\$;/gi, '') // Remove PG enum type creations
    .replace(/\brole user_role\b/gi, 'role TEXT')
    .replace(/\bmovement_type movement_type\b/gi, 'movement_type TEXT');
  return adapted.trim();
};

const executeSqliteQuery = (sql, params = []) => {
  initSqlite();
  const cleanSql = adaptSqlForSqlite(sql);
  if (!cleanSql) return { rows: [] };

  // Convert Javascript booleans to 1/0 for SQLite parameter binding
  const boundParams = params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p));

  const isSelect = /^\s*(SELECT|PRAGMA|EXPLAIN)/i.test(cleanSql);
  const isReturning = /RETURNING/i.test(cleanSql);
  const isTransaction = /^\s*(BEGIN|COMMIT|ROLLBACK)/i.test(cleanSql);

  if (isTransaction) {
    sqliteDb.exec(cleanSql);
    return { rows: [] };
  }

  const stmt = sqliteDb.prepare(cleanSql);

  if (isSelect || isReturning) {
    const rows = stmt.all(...boundParams);
    const mappedRows = rows.map((row) => {
      const copy = { ...row };
      if ('is_active' in copy) {
        copy.is_active = Boolean(copy.is_active);
      }
      return copy;
    });
    return { rows: mappedRows };
  } else {
    const result = stmt.run(...boundParams);
    return { rows: [], lastInsertRowid: result.lastInsertRowid, changes: result.changes };
  }
};

module.exports = {
  query: async (text, params = []) => {
    if (usePostgres) {
      return await pgPool.query(text, params);
    } else {
      return executeSqliteQuery(text, params);
    }
  },
  getClient: async () => {
    if (usePostgres) {
      const client = await pgPool.connect();
      return client;
    } else {
      return {
        query: async (text, params = []) => executeSqliteQuery(text, params),
        release: () => {}
      };
    }
  },
  pool: pgPool
};
