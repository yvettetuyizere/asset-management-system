-- Create database schema for RTB Asset Management System
-- Run this script to create the database schema, or use the init.js script

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Staff', 'Headteacher')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  sector VARCHAR(255) NOT NULL,
  headteacher_name VARCHAR(255) NOT NULL,
  headteacher_phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR(255) UNIQUE NOT NULL,
  device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('Laptop', 'Projector', 'Desktop', 'Tablet', 'Printer', 'Other')),
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  processor VARCHAR(255),
  ram VARCHAR(255),
  storage VARCHAR(255),
  screen_size VARCHAR(255),
  resolution VARCHAR(255),
  other_specs TEXT,
  status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'Damaged', 'Under Repair', 'Retired')),
  condition VARCHAR(50) DEFAULT 'Good' CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged')),
  purchase_date DATE,
  warranty_expiry DATE,
  assigned_to INTEGER REFERENCES schools(id) ON DELETE SET NULL,
  assigned_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device requests table
CREATE TABLE IF NOT EXISTS device_requests (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  requested_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('Laptop', 'Projector', 'Desktop', 'Tablet', 'Printer', 'Other')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  reason TEXT NOT NULL,
  processor VARCHAR(255),
  ram VARCHAR(255),
  storage VARCHAR(255),
  screen_size VARCHAR(255),
  other_specs TEXT,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Fulfilled')),
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT,
  approved_date TIMESTAMP,
  fulfilled_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device request assignments (many-to-many relationship)
CREATE TABLE IF NOT EXISTS device_request_assignments (
  request_id INTEGER NOT NULL REFERENCES device_requests(id) ON DELETE CASCADE,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  PRIMARY KEY (request_id, device_id)
);

-- Issue reports table
CREATE TABLE IF NOT EXISTS issue_reports (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  reported_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN ('Hardware Failure', 'Software Issue', 'Physical Damage', 'Performance Issue', 'Other')),
  description TEXT NOT NULL,
  severity VARCHAR(50) DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status VARCHAR(50) DEFAULT 'Reported' CHECK (status IN ('Reported', 'Under Investigation', 'In Progress', 'Resolved', 'Closed')),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolution TEXT,
  resolved_date TIMESTAMP,
  attachments TEXT[], -- Array of attachment URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_assigned_to ON devices(assigned_to);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_device_type ON devices(device_type);
CREATE INDEX IF NOT EXISTS idx_device_requests_school ON device_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_device_requests_status ON device_requests(status);
CREATE INDEX IF NOT EXISTS idx_issue_reports_school ON issue_reports(school_id);
CREATE INDEX IF NOT EXISTS idx_issue_reports_device ON issue_reports(device_id);
CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON issue_reports(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_device_requests_updated_at ON device_requests;
CREATE TRIGGER update_device_requests_updated_at BEFORE UPDATE ON device_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_issue_reports_updated_at ON issue_reports;
CREATE TRIGGER update_issue_reports_updated_at BEFORE UPDATE ON issue_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

