import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const dbPath = path.join(__dirname, '../../../database/wrongful_conviction.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

// Compatibility layer for PostgreSQL-style query function
export async function query(sql: string, params?: any[]): Promise<any> {
  const database = await getDatabase();
  
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    const rows = await database.all(sql, params);
    return { rows };
  } else {
    const result = await database.run(sql, params);
    return { 
      rows: [],
      rowCount: result.changes,
      lastID: result.lastID
    };
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}