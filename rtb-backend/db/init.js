import pool from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDatabase = async () => {
  try {
    // Read and execute schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the entire schema as one query (better for functions and triggers)
    await pool.query(schemaSQL);
    
    console.log('Database schema initialized successfully!');
  } catch (error) {
    // If error is about existing objects, that's okay (idempotent)
    if (error.message && error.message.includes('already exists')) {
      console.log('Database schema already exists, skipping initialization');
    } else {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
};

export default initDatabase;

