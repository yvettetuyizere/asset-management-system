// models/DeviceRequest.js - PostgreSQL version
import pool from '../db/connection.js';

export default {
  // Find requests with filters and populate
  async find(filter = {}) {
    let query = `
      SELECT dr.*, 
             s.name as school_name, s.province as school_province, s.district as school_district,
             u1.email as requested_by_email,
             u2.email as reviewed_by_email
      FROM device_requests dr
      LEFT JOIN schools s ON dr.school_id = s.id
      LEFT JOIN users u1 ON dr.requested_by = u1.id
      LEFT JOIN users u2 ON dr.reviewed_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filter.status) {
      query += ` AND dr.status = $${paramCount}`;
      params.push(filter.status);
      paramCount++;
    }
    if (filter.school) {
      query += ` AND dr.school_id = $${paramCount}`;
      params.push(filter.school);
      paramCount++;
    }
    if (filter.deviceType) {
      query += ` AND dr.device_type = $${paramCount}`;
      params.push(filter.deviceType);
      paramCount++;
    }

    query += ' ORDER BY dr.created_at DESC';
    
    const result = await pool.query(query, params);
    const requests = await Promise.all(result.rows.map(async row => {
      const formatted = this.formatRequest(row);
      // Populate assigned devices
      if (formatted._id) {
        const devicesQuery = `
          SELECT d.* FROM devices d
          INNER JOIN device_request_assignments dra ON d.id = dra.device_id
          WHERE dra.request_id = $1
        `;
        const devicesResult = await pool.query(devicesQuery, [formatted._id]);
        formatted.assignedDevices = devicesResult.rows.map(d => ({
          _id: d.id,
          id: d.id,
          serialNumber: d.serial_number,
          deviceType: d.device_type,
          brand: d.brand,
          model: d.model
        }));
      }
      return formatted;
    }));
    
    return requests;
  },

  // Find request by ID
  async findById(id) {
    const query = `
      SELECT dr.*, 
             s.name as school_name, s.province as school_province, s.district as school_district,
             s.headteacher_name, s.headteacher_phone,
             u1.email as requested_by_email,
             u2.email as reviewed_by_email
      FROM device_requests dr
      LEFT JOIN schools s ON dr.school_id = s.id
      LEFT JOIN users u1 ON dr.requested_by = u1.id
      LEFT JOIN users u2 ON dr.reviewed_by = u2.id
      WHERE dr.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;

    const formatted = this.formatRequest(result.rows[0]);
    
    // Populate assigned devices
    const devicesQuery = `
      SELECT d.* FROM devices d
      INNER JOIN device_request_assignments dra ON d.id = dra.device_id
      WHERE dra.request_id = $1
    `;
    const devicesResult = await pool.query(devicesQuery, [id]);
    formatted.assignedDevices = devicesResult.rows.map(d => ({
      _id: d.id,
      id: d.id,
      serialNumber: d.serial_number,
      deviceType: d.device_type,
      brand: d.brand,
      model: d.model
    }));

    return formatted;
  },

  // Create new request
  async create(requestData) {
    const {
      school, requestedBy, deviceType, quantity, priority = 'Medium',
      reason, specifications = {}, status = 'Pending'
    } = requestData;

    const query = `
      INSERT INTO device_requests (
        school_id, requested_by, device_type, quantity, priority, reason,
        processor, ram, storage, screen_size, other_specs, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      school, requestedBy, deviceType, quantity, priority, reason,
      specifications.processor || null,
      specifications.ram || null,
      specifications.storage || null,
      specifications.screenSize || null,
      specifications.other || null,
      status
    ]);
    
    return this.formatRequest(result.rows[0]);
  },

  // Update request
  async findByIdAndUpdate(id, updateData, options = {}) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      status: 'status',
      reviewNotes: 'review_notes',
      reviewedBy: 'reviewed_by',
      approvedDate: 'approved_date',
      fulfilledDate: 'fulfilled_date',
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
      UPDATE device_requests 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.formatRequest(result.rows[0]) : null;
  },

  // Add assigned devices to request
  async addAssignedDevices(requestId, deviceIds) {
    // Delete existing assignments
    await pool.query('DELETE FROM device_request_assignments WHERE request_id = $1', [requestId]);
    
    // Insert new assignments
    if (deviceIds && deviceIds.length > 0) {
      const values = deviceIds.map((deviceId, index) => `($1, $${index + 2})`).join(', ');
      const params = [requestId, ...deviceIds];
      await pool.query(
        `INSERT INTO device_request_assignments (request_id, device_id) VALUES ${values}`,
        params
      );
    }
  },

  // Delete request
  async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM device_requests WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] ? this.formatRequest(result.rows[0]) : null;
  },

  // Format request for response
  formatRequest(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      school: row.school_id ? {
        _id: row.school_id,
        id: row.school_id,
        name: row.school_name,
        province: row.school_province,
        district: row.school_district,
        headteacher: row.headteacher_name ? {
          name: row.headteacher_name,
          phone: row.headteacher_phone
        } : undefined
      } : null,
      requestedBy: row.requested_by ? {
        _id: row.requested_by,
        id: row.requested_by,
        email: row.requested_by_email
      } : null,
      deviceType: row.device_type,
      quantity: row.quantity,
      priority: row.priority,
      reason: row.reason,
      specifications: {
        processor: row.processor,
        ram: row.ram,
        storage: row.storage,
        screenSize: row.screen_size,
        other: row.other_specs
      },
      status: row.status,
      reviewedBy: row.reviewed_by ? {
        _id: row.reviewed_by,
        id: row.reviewed_by,
        email: row.reviewed_by_email
      } : null,
      reviewNotes: row.review_notes,
      approvedDate: row.approved_date,
      fulfilledDate: row.fulfilled_date,
      assignedDevices: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
};
