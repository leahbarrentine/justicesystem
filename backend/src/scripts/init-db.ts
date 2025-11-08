import { initDatabase } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function initializeDatabase() {
  try {
    console.log('Initializing SQLite database...');
    
    const db = await initDatabase();
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../../database/schema.sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await db.exec(schema);
    
    console.log('Database schema created successfully');
    console.log('Database ready at: wrongful-conviction-detection/database/wrongful_conviction.db');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();