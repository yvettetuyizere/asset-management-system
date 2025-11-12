import { createTables } from './db/tables.js';
import pool from './db/connection.js';

const startApp = async () => {
  try {
    console.log('Running table creation...');
    await createTables();
    console.log('Setup complete, backend is ready ✅');
  } catch (err) {
    console.error('Error in startApp:', err);
  } finally {
    await pool.end(); // close the connection
    console.log('Database connection closed.');
  }
};

startApp();
