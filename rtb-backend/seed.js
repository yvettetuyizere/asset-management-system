import pool from './db/connection.js';
import initDatabase from './db/init.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Initialize database schema
    await initDatabase();
    console.log("Database schema initialized");

    // Clear existing data
    await pool.query('DELETE FROM device_request_assignments');
    await pool.query('DELETE FROM issue_reports');
    await pool.query('DELETE FROM device_requests');
    await pool.query('DELETE FROM devices');
    await pool.query('DELETE FROM schools');
    await pool.query('DELETE FROM users');
    console.log("Existing data cleared");

    // Reset sequences
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE schools_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE devices_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE device_requests_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE issue_reports_id_seq RESTART WITH 1');

    // Create users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const staffPassword = await bcrypt.hash("staff123", 10);
    const headteacherPassword = await bcrypt.hash("head123", 10);
    const yvettePassword = await bcrypt.hash("password123", 10);

    const adminResult = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ["admin", "admin@rtb.gov.rw", adminPassword, "Admin"]
    );
    const admin = adminResult.rows[0];

    const staffResult = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ["staff", "staff@rtb.gov.rw", staffPassword, "Staff"]
    );
    const staff = staffResult.rows[0];

    const headteacherResult = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ["headteacher", "headteacher@school.rw", headteacherPassword, "Headteacher"]
    );
    const headteacher = headteacherResult.rows[0];

    const yvetteResult = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ["yvette", "yvettetuyizere@gmail.com", yvettePassword, "Admin"]
    );
    const yvette = yvetteResult.rows[0];

    // Create schools
    const school1Result = await pool.query(
      'INSERT INTO schools (name, province, district, sector, headteacher_name, headteacher_phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      ["GS Nyabitare", "Eastern Province", "Kirehe", "Nyabitare", "Jean Felix Kayitare", "+250788123456"]
    );
    const school1 = school1Result.rows[0];

    const school2Result = await pool.query(
      'INSERT INTO schools (name, province, district, sector, headteacher_name, headteacher_phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      ["GS Gahini", "Eastern Province", "Kayonza", "Gahini", "Marie Claire Mukamana", "+250788654321"]
    );
    const school2 = school2Result.rows[0];

    // Create devices
    const device1Result = await pool.query(
      `INSERT INTO devices (
        serial_number, device_type, brand, model,
        processor, ram, storage, screen_size, resolution,
        status, condition, assigned_to, assigned_date,
        purchase_date, warranty_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        "LAP001", "Laptop", "HP", "Pavilion 15",
        "Intel i5", "8GB", "256GB SSD", "15.6\"", "1920x1080",
        "Assigned", "Good", school1.id, new Date(),
        new Date("2023-01-15"), new Date("2026-01-15")
      ]
    );
    const device1 = device1Result.rows[0];

    const device2Result = await pool.query(
      `INSERT INTO devices (
        serial_number, device_type, brand, model,
        processor, ram, storage, screen_size, resolution,
        status, condition, purchase_date, warranty_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        "LAP002", "Laptop", "Dell", "Inspiron 15",
        "Intel i7", "16GB", "512GB SSD", "15.6\"", "1920x1080",
        "Available", "Excellent",
        new Date("2023-03-20"), new Date("2026-03-20")
      ]
    );
    const device2 = device2Result.rows[0];

    const device3Result = await pool.query(
      `INSERT INTO devices (
        serial_number, device_type, brand, model,
        resolution, other_specs,
        status, condition, assigned_to, assigned_date,
        purchase_date, warranty_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        "PROJ001", "Projector", "Epson", "PowerLite 1781W",
        "1280x800", "HDMI, VGA, USB",
        "Assigned", "Good", school2.id, new Date(),
        new Date("2023-02-10"), new Date("2026-02-10")
      ]
    );
    const device3 = device3Result.rows[0];

    const device4Result = await pool.query(
      `INSERT INTO devices (
        serial_number, device_type, brand, model,
        processor, ram, storage, screen_size, resolution,
        status, condition, assigned_to, assigned_date,
        purchase_date, warranty_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        "DESK001", "Desktop", "HP", "Pavilion Desktop",
        "Intel i5", "8GB", "1TB HDD", "21.5\"", "1920x1080",
        "Damaged", "Poor", school1.id, new Date(),
        new Date("2022-11-05"), new Date("2025-11-05")
      ]
    );
    const device4 = device4Result.rows[0];

    // Create device requests
    const request1Result = await pool.query(
      `INSERT INTO device_requests (
        school_id, requested_by, device_type, quantity, priority, reason,
        processor, ram, storage, screen_size, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        school1.id, headteacher.id, "Laptop", 2, "High",
        "Need additional laptops for computer lab expansion",
        "Intel i5 or better", "8GB minimum", "256GB SSD", "15\" or larger",
        "Pending"
      ]
    );
    const request1 = request1Result.rows[0];

    const request2Result = await pool.query(
      `INSERT INTO device_requests (
        school_id, requested_by, device_type, quantity, priority, reason,
        resolution, other_specs, status, reviewed_by, review_notes, approved_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        school2.id, headteacher.id, "Projector", 1, "Medium",
        "Replace damaged projector in main hall",
        "HD or better", "3000+ lumens", "Approved", staff.id,
        "Approved for immediate fulfillment", new Date()
      ]
    );
    const request2 = request2Result.rows[0];

    // Create issue reports
    await pool.query(
      `INSERT INTO issue_reports (
        school_id, reported_by, device_id, issue_type, description, severity, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        school1.id, headteacher.id, device4.id, "Hardware Failure",
        "Desktop computer not powering on. Suspected power supply failure.",
        "High", "Reported"
      ]
    );

    await pool.query(
      `INSERT INTO issue_reports (
        school_id, reported_by, device_id, issue_type, description, severity, status, assigned_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        school2.id, headteacher.id, device3.id, "Performance Issue",
        "Projector image is dim and colors are washed out. May need bulb replacement.",
        "Medium", "Under Investigation", staff.id
      ]
    );

    console.log("Seed data created successfully!");
    console.log("Users created:", { 
      admin: admin.email, 
      staff: staff.email, 
      headteacher: headteacher.email,
      yvette: yvette.email
    });
    console.log("Schools created: 2");
    console.log("Devices created: 4");
    console.log("Requests created: 2");
    console.log("Reports created: 2");

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await pool.end();
    console.log("Disconnected from PostgreSQL");
  }
};

seedData();
