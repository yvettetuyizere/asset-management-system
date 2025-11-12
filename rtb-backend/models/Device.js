// models/Device.js - PostgreSQL version
import pool from '../db/connection.js';

export default {
  // Find devices with filters and populate
  async find(filter = {}) {
    let query = 'SELECT d.*, s.name as school_name, s.province, s.district FROM devices d LEFT JOIN schools s ON d.assigned_to = s.id WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filter.status) {
      query += ` AND d.status = $${paramCount}`;
      params.push(filter.status);
      paramCount++;
    }
    if (filter.deviceType) {
      query += ` AND d.device_type = $${paramCount}`;
      params.push(filter.deviceType);
      paramCount++;
    }
    if (filter.assignedTo) {
      query += ` AND d.assigned_to = $${paramCount}`;
      params.push(filter.assignedTo);
      paramCount++;
    }
    if (filter._id && filter._id.$in) {
      query += ` AND d.id = ANY($${paramCount})`;
      params.push(filter._id.$in);
      paramCount++;
    }

    query += ' ORDER BY d.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows.map(row => this.formatDevice(row));
  },

  // Find device by ID
  async findById(id) {
    const query = `
      SELECT d.*, s.name as school_name, s.province, s.district, 
             s.headteacher_name, s.headteacher_phone
      FROM devices d 
      LEFT JOIN schools s ON d.assigned_to = s.id 
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.formatDevice(result.rows[0]) : null;
  },

  // Create new device
  async create(deviceData) {
    const {
      serialNumber, deviceType, brand, model, specifications = {},
      status = 'Available', condition = 'Good', purchaseDate, warrantyExpiry,
      assignedTo, assignedDate, notes
    } = deviceData;

    const query = `
      INSERT INTO devices (
        serial_number, device_type, brand, model,
        processor, ram, storage, screen_size, resolution, other_specs,
        status, condition, purchase_date, warranty_expiry,
        assigned_to, assigned_date, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      serialNumber, deviceType, brand, model,
      specifications.processor || null,
      specifications.ram || null,
      specifications.storage || null,
      specifications.screenSize || null,
      specifications.resolution || null,
      specifications.other || null,
      status, condition, purchaseDate, warrantyExpiry,
      assignedTo, assignedDate, notes
    ]);
    
    return this.formatDevice(result.rows[0]);
  },

  // Update device
  async findByIdAndUpdate(id, updateData, options = {}) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Handle specifications object
    if (updateData.specifications) {
      if (updateData.specifications.processor !== undefined) {
        fields.push(`processor = $${paramCount++}`);
        values.push(updateData.specifications.processor);
      }
      if (updateData.specifications.ram !== undefined) {
        fields.push(`ram = $${paramCount++}`);
        values.push(updateData.specifications.ram);
      }
      if (updateData.specifications.storage !== undefined) {
        fields.push(`storage = $${paramCount++}`);
        values.push(updateData.specifications.storage);
      }
      if (updateData.specifications.screenSize !== undefined) {
        fields.push(`screen_size = $${paramCount++}`);
        values.push(updateData.specifications.screenSize);
      }
      if (updateData.specifications.resolution !== undefined) {
        fields.push(`resolution = $${paramCount++}`);
        values.push(updateData.specifications.resolution);
      }
      if (updateData.specifications.other !== undefined) {
        fields.push(`other_specs = $${paramCount++}`);
        values.push(updateData.specifications.other);
      }
      delete updateData.specifications;
    }

    // Handle camelCase to snake_case conversion
    const fieldMap = {
      serialNumber: 'serial_number',
      deviceType: 'device_type',
      purchaseDate: 'purchase_date',
      warrantyExpiry: 'warranty_expiry',
      assignedTo: 'assigned_to',
      assignedDate: 'assigned_date',
      updatedAt: 'updated_at'
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = $${paramCount++}`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE devices 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.formatDevice(result.rows[0]) : null;
  },

  // Update many devices
  async updateMany(filter, update) {
    const { _id } = filter;
    if (_id && _id.$in) {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap = {
        assignedTo: 'assigned_to',
        assignedDate: 'assigned_date',
        status: 'status',
        updatedAt: 'updated_at'
      };

      Object.keys(update).forEach(key => {
        if (update[key] !== undefined) {
          const dbField = fieldMap[key] || key;
          fields.push(`${dbField} = $${paramCount++}`);
          values.push(update[key]);
        }
      });

      values.push(_id.$in);
      const query = `
        UPDATE devices 
        SET ${fields.join(', ')}
        WHERE id = ANY($${paramCount})
        RETURNING *
      `;
      const result = await pool.query(query, values);
      return { modifiedCount: result.rowCount };
    }
    return { modifiedCount: 0 };
  },

  // Delete device
  async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM devices WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] ? this.formatDevice(result.rows[0]) : null;
  },

  // Count documents
  async countDocuments(filter = {}) {
    let query = 'SELECT COUNT(*) FROM devices WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filter.assignedTo) {
      query += ` AND assigned_to = $${paramCount}`;
      params.push(filter.assignedTo);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  },

  // Aggregate (for statistics)
  async aggregate(pipeline) {
    // Handle $match and $group operations
    const matchStage = pipeline.find(stage => stage.$match);
    const groupStage = pipeline.find(stage => stage.$group);

    if (matchStage && groupStage) {
      const match = matchStage.$match;
      const group = groupStage.$group;
      const groupField = Object.keys(group._id || {})[0] || group._id;

      let query = `SELECT ${groupField === '$deviceType' ? 'device_type' : groupField === '$status' ? 'status' : groupField} as _id, COUNT(*) as count FROM devices WHERE 1=1`;
      const params = [];
      let paramCount = 1;

      if (match.assignedTo) {
        query += ` AND assigned_to = $${paramCount}`;
        params.push(match.assignedTo);
        paramCount++;
      }

      query += ` GROUP BY ${groupField === '$deviceType' ? 'device_type' : groupField === '$status' ? 'status' : groupField}`;

      const result = await pool.query(query, params);
      return result.rows;
    }

    return [];
  },

  // Format device for response (convert snake_case to camelCase)
  formatDevice(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      serialNumber: row.serial_number,
      deviceType: row.device_type,
      brand: row.brand,
      model: row.model,
      specifications: {
        processor: row.processor,
        ram: row.ram,
        storage: row.storage,
        screenSize: row.screen_size,
        resolution: row.resolution,
        other: row.other_specs
      },
      status: row.status,
      condition: row.condition,
      purchaseDate: row.purchase_date,
      warrantyExpiry: row.warranty_expiry,
      assignedTo: row.assigned_to ? {
        _id: row.assigned_to,
        id: row.assigned_to,
        name: row.school_name,
        province: row.province,
        district: row.district,
        headteacher: row.headteacher_name ? {
          name: row.headteacher_name,
          phone: row.headteacher_phone
        } : undefined
      } : null,
      assignedDate: row.assigned_date,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
};
