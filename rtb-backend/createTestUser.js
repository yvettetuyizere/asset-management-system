// createTestUser.js
import pool from './db/connection.js';
import bcrypt from 'bcryptjs';

const createTestUser = async () => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Insert user into PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (name, email, role, password)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      ['Yvette Tuyizere', 'yvettetuyizere@gmail.com', 'admin', hashedPassword]
    );

    console.log('Test user created ✅');
    console.log(result.rows[0]); // shows the user info
  } catch (err) {
    console.error('Error creating test user:', err);
  } finally {
    pool.end(); // close DB connection
  }
};

// Run the function
createTestUser();

 