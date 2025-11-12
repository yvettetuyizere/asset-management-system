import pool from './connection.js';

export const createTables = async () => {
  try {
    // --- Users table ---
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created ✅');

    // --- Devices table ---
    console.log('Creating devices table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        name_tag VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        model VARCHAR(50),
        serial_number VARCHAR(50),
        brand VARCHAR(50),
        specifications TEXT,
        purchase_date DATE,
        expired_date DATE,
        current_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Devices table created ✅');

    // --- Schools table ---
    console.log('Creating schools table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        district VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Schools table created ✅');

    // --- Assignments table ---
    console.log('Creating assignments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        device_id INT REFERENCES devices(id) ON DELETE CASCADE,
        school_id INT REFERENCES schools(id) ON DELETE CASCADE,
        assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50)
      );
    `);
    console.log('Assignments table created ✅');

    console.log('All tables are ready 🚀');

  } catch (err) {
    console.error('Error creating tables:', err);
  }
};
