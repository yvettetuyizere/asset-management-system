// models/User.js - PostgreSQL version
import pool from '../db/connection.js';

export default {
  // Find user by username or email
  async findOne(conditions) {
    const { $or } = conditions;
    if ($or) {
      const query = `
        SELECT * FROM users 
        WHERE username = $1 OR email = $1
        LIMIT 1
      `;
      const identifier = $or[0].username || $or[0].email || $or[1]?.username || $or[1]?.email;
      const result = await pool.query(query, [identifier]);
      return result.rows[0] || null;
    }
    
    // Handle other conditions
    if (conditions.email) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [conditions.email]);
      return result.rows[0] || null;
    }
    
    if (conditions.username) {
      const result = await pool.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [conditions.username]);
      return result.rows[0] || null;
    }
    
    return null;
  },

  // Create new user
  async create(userData) {
    const { username, email, password, role } = userData;
    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [username, email, password, role]);
    return result.rows[0];
  },

  // Update user
  async updateOne(conditions, update) {
    const { $set } = update;
    if (conditions.email && $set) {
      const fields = Object.keys($set);
      const values = Object.values($set);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const query = `UPDATE users SET ${setClause} WHERE email = $1 RETURNING *`;
      const result = await pool.query(query, [conditions.email, ...values]);
      return result.rows[0] || null;
    }
    return null;
  },

  // Find by ID
  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
};
