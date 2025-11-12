// models/School.js - PostgreSQL version
import pool from '../db/connection.js';

export default {
  // Find schools with filters
  async find(filter = {}) {
    let query = 'SELECT * FROM schools WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filter.province) {
      query += ` AND province = $${paramCount}`;
      params.push(filter.province);
      paramCount++;
    }
    if (filter.district) {
      query += ` AND district = $${paramCount}`;
      params.push(filter.district);
      paramCount++;
    }
    if (filter.sector) {
      query += ` AND sector = $${paramCount}`;
      params.push(filter.sector);
      paramCount++;
    }

    query += ' ORDER BY name ASC';
    
    const result = await pool.query(query, params);
    return result.rows.map(row => this.formatSchool(row));
  },

  // Find school by ID
  async findById(id) {
    const result = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
    return result.rows[0] ? this.formatSchool(result.rows[0]) : null;
  },

  // Create new school
  async create(schoolData) {
    const { name, province, district, sector, headteacher } = schoolData;
    const query = `
      INSERT INTO schools (name, province, district, sector, headteacher_name, headteacher_phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      name, province, district, sector,
      headteacher.name, headteacher.phone
    ]);
    return this.formatSchool(result.rows[0]);
  },

  // Update school
  async findByIdAndUpdate(id, updateData, options = {}) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updateData.name);
    }
    if (updateData.province !== undefined) {
      fields.push(`province = $${paramCount++}`);
      values.push(updateData.province);
    }
    if (updateData.district !== undefined) {
      fields.push(`district = $${paramCount++}`);
      values.push(updateData.district);
    }
    if (updateData.sector !== undefined) {
      fields.push(`sector = $${paramCount++}`);
      values.push(updateData.sector);
    }
    if (updateData.headteacher) {
      if (updateData.headteacher.name !== undefined) {
        fields.push(`headteacher_name = $${paramCount++}`);
        values.push(updateData.headteacher.name);
      }
      if (updateData.headteacher.phone !== undefined) {
        fields.push(`headteacher_phone = $${paramCount++}`);
        values.push(updateData.headteacher.phone);
      }
    }
    if (updateData.updatedAt !== undefined) {
      fields.push(`updated_at = $${paramCount++}`);
      values.push(updateData.updatedAt);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE schools 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.formatSchool(result.rows[0]) : null;
  },

  // Delete school
  async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM schools WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] ? this.formatSchool(result.rows[0]) : null;
  },

  // Format school for response
  formatSchool(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      name: row.name,
      province: row.province,
      district: row.district,
      sector: row.sector,
      headteacher: {
        name: row.headteacher_name,
        phone: row.headteacher_phone
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
};
