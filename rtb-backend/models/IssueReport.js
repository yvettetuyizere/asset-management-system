// models/IssueReport.js - PostgreSQL version
import pool from '../db/connection.js';

export default {
  // Find reports with filters and populate
  async find(filter = {}) {
    let query = `
      SELECT ir.*,
             s.name as school_name, s.province as school_province, s.district as school_district,
             u1.email as reported_by_email,
             u2.email as assigned_to_email,
             d.serial_number as device_serial_number, d.device_type as device_device_type,
             d.brand as device_brand, d.model as device_model
      FROM issue_reports ir
      LEFT JOIN schools s ON ir.school_id = s.id
      LEFT JOIN users u1 ON ir.reported_by = u1.id
      LEFT JOIN users u2 ON ir.assigned_to = u2.id
      LEFT JOIN devices d ON ir.device_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filter.status) {
      query += ` AND ir.status = $${paramCount}`;
      params.push(filter.status);
      paramCount++;
    }
    if (filter.school) {
      query += ` AND ir.school_id = $${paramCount}`;
      params.push(filter.school);
      paramCount++;
    }
    if (filter.issueType) {
      query += ` AND ir.issue_type = $${paramCount}`;
      params.push(filter.issueType);
      paramCount++;
    }
    if (filter.severity) {
      query += ` AND ir.severity = $${paramCount}`;
      params.push(filter.severity);
      paramCount++;
    }

    query += ' ORDER BY ir.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows.map(row => this.formatReport(row));
  },

  // Find report by ID
  async findById(id) {
    const query = `
      SELECT ir.*,
             s.name as school_name, s.province as school_province, s.district as school_district,
             s.headteacher_name, s.headteacher_phone,
             u1.email as reported_by_email,
             u2.email as assigned_to_email,
             d.serial_number as device_serial_number, d.device_type as device_device_type,
             d.brand as device_brand, d.model as device_model,
             d.processor as device_processor, d.ram as device_ram,
             d.storage as device_storage, d.screen_size as device_screen_size,
             d.resolution as device_resolution, d.other_specs as device_other_specs
      FROM issue_reports ir
      LEFT JOIN schools s ON ir.school_id = s.id
      LEFT JOIN users u1 ON ir.reported_by = u1.id
      LEFT JOIN users u2 ON ir.assigned_to = u2.id
      LEFT JOIN devices d ON ir.device_id = d.id
      WHERE ir.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.formatReport(result.rows[0], true) : null;
  },

  // Create new report
  async create(reportData) {
    const {
      school, reportedBy, device, issueType, description,
      severity = 'Medium', status = 'Reported'
    } = reportData;

    const query = `
      INSERT INTO issue_reports (
        school_id, reported_by, device_id, issue_type, description, severity, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      school, reportedBy, device, issueType, description, severity, status
    ]);
    
    return this.formatReport(result.rows[0]);
  },

  // Update report
  async findByIdAndUpdate(id, updateData, options = {}) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      status: 'status',
      assignedTo: 'assigned_to',
      resolution: 'resolution',
      resolvedDate: 'resolved_date',
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
      UPDATE issue_reports 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.formatReport(result.rows[0]) : null;
  },

  // Delete report
  async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM issue_reports WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] ? this.formatReport(result.rows[0]) : null;
  },

  // Format report for response
  formatReport(row, includeFullDevice = false) {
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
      reportedBy: row.reported_by ? {
        _id: row.reported_by,
        id: row.reported_by,
        email: row.reported_by_email
      } : null,
      device: row.device_id ? {
        _id: row.device_id,
        id: row.device_id,
        serialNumber: row.device_serial_number,
        deviceType: row.device_device_type,
        brand: row.device_brand,
        model: row.device_model,
        ...(includeFullDevice ? {
          specifications: {
            processor: row.device_processor,
            ram: row.device_ram,
            storage: row.device_storage,
            screenSize: row.device_screen_size,
            resolution: row.device_resolution,
            other: row.device_other_specs
          }
        } : {})
      } : null,
      issueType: row.issue_type,
      description: row.description,
      severity: row.severity,
      status: row.status,
      assignedTo: row.assigned_to ? {
        _id: row.assigned_to,
        id: row.assigned_to,
        email: row.assigned_to_email
      } : null,
      resolution: row.resolution,
      resolvedDate: row.resolved_date,
      attachments: row.attachments || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
};
