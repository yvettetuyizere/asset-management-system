import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import School from "./models/School.js";
import Device from "./models/Device.js";
import DeviceRequest from "./models/DeviceRequest.js";
import IssueReport from "./models/IssueReport.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await School.deleteMany({});
    await Device.deleteMany({});
    await DeviceRequest.deleteMany({});
    await IssueReport.deleteMany({});

    // Create users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const staffPassword = await bcrypt.hash("staff123", 10);
    const headteacherPassword = await bcrypt.hash("head123", 10);
    const yourPassword = await bcrypt.hash("password123", 10); // Change this to your preferred password

    const admin = await User.create({
      username: "admin",
      email: "admin@rtb.gov.rw",
      password: adminPassword,
      role: "Admin"
    });

    const staff = await User.create({
      username: "staff",
      email: "staff@rtb.gov.rw",
      password: staffPassword,
      role: "Staff"
    });

    const headteacher = await User.create({
      username: "headteacher",
      email: "headteacher@school.rw",
      password: headteacherPassword,
      role: "Headteacher"
    });

    // Create your personal user account
    // Hash password123 properly
    const yvettePassword = await bcrypt.hash("password123", 10);
    const yourAccount = await User.create({
      username: "yvette", // You can change this to your preferred username
      email: "yvettetuyizere@gmail.com",
      password: yvettePassword,
      role: "Admin"
    });

    // Create schools
    const school1 = await School.create({
      name: "GS Nyabitare",
      province: "Eastern Province",
      district: "Kirehe",
      sector: "Nyabitare",
      headteacher: {
        name: "Jean Felix Kayitare",
        phone: "+250788123456"
      }
    });

    const school2 = await School.create({
      name: "GS Gahini",
      province: "Eastern Province",
      district: "Kayonza",
      sector: "Gahini",
      headteacher: {
        name: "Marie Claire Mukamana",
        phone: "+250788654321"
      }
    });

    // Create devices
    const devices = await Device.create([
      {
        serialNumber: "LAP001",
        deviceType: "Laptop",
        brand: "HP",
        model: "Pavilion 15",
        specifications: {
          processor: "Intel i5",
          ram: "8GB",
          storage: "256GB SSD",
          screenSize: "15.6\"",
          resolution: "1920x1080"
        },
        status: "Assigned",
        condition: "Good",
        assignedTo: school1._id,
        assignedDate: new Date(),
        purchaseDate: new Date("2023-01-15"),
        warrantyExpiry: new Date("2026-01-15")
      },
      {
        serialNumber: "LAP002",
        deviceType: "Laptop",
        brand: "Dell",
        model: "Inspiron 15",
        specifications: {
          processor: "Intel i7",
          ram: "16GB",
          storage: "512GB SSD",
          screenSize: "15.6\"",
          resolution: "1920x1080"
        },
        status: "Available",
        condition: "Excellent",
        purchaseDate: new Date("2023-03-20"),
        warrantyExpiry: new Date("2026-03-20")
      },
      {
        serialNumber: "PROJ001",
        deviceType: "Projector",
        brand: "Epson",
        model: "PowerLite 1781W",
        specifications: {
          resolution: "1280x800",
          brightness: "3200 lumens",
          other: "HDMI, VGA, USB"
        },
        status: "Assigned",
        condition: "Good",
        assignedTo: school2._id,
        assignedDate: new Date(),
        purchaseDate: new Date("2023-02-10"),
        warrantyExpiry: new Date("2026-02-10")
      },
      {
        serialNumber: "DESK001",
        deviceType: "Desktop",
        brand: "HP",
        model: "Pavilion Desktop",
        specifications: {
          processor: "Intel i5",
          ram: "8GB",
          storage: "1TB HDD",
          screenSize: "21.5\"",
          resolution: "1920x1080"
        },
        status: "Damaged",
        condition: "Poor",
        assignedTo: school1._id,
        assignedDate: new Date(),
        purchaseDate: new Date("2022-11-05"),
        warrantyExpiry: new Date("2025-11-05")
      }
    ]);

    // Create device requests
    await DeviceRequest.create({
      school: school1._id,
      requestedBy: headteacher._id,
      deviceType: "Laptop",
      quantity: 2,
      priority: "High",
      reason: "Need additional laptops for computer lab expansion",
      specifications: {
        processor: "Intel i5 or better",
        ram: "8GB minimum",
        storage: "256GB SSD",
        screenSize: "15\" or larger"
      },
      status: "Pending"
    });

    await DeviceRequest.create({
      school: school2._id,
      requestedBy: headteacher._id,
      deviceType: "Projector",
      quantity: 1,
      priority: "Medium",
      reason: "Replace damaged projector in main hall",
      specifications: {
        resolution: "HD or better",
        brightness: "3000+ lumens"
      },
      status: "Approved",
      reviewedBy: staff._id,
      reviewNotes: "Approved for immediate fulfillment",
      approvedDate: new Date()
    });

    // Create issue reports
    await IssueReport.create({
      school: school1._id,
      reportedBy: headteacher._id,
      device: devices[3]._id, // The damaged desktop
      issueType: "Hardware Failure",
      description: "Desktop computer not powering on. Suspected power supply failure.",
      severity: "High",
      status: "Reported"
    });

    await IssueReport.create({
      school: school2._id,
      reportedBy: headteacher._id,
      device: devices[2]._id, // The projector
      issueType: "Performance Issue",
      description: "Projector image is dim and colors are washed out. May need bulb replacement.",
      severity: "Medium",
      status: "Under Investigation",
      assignedTo: staff._id
    });

    console.log("Seed data created successfully!");
    console.log("Users created:", { 
      admin: admin.email, 
      staff: staff.email, 
      headteacher: headteacher.email,
      yvette: yourAccount.email
    });
    console.log("Schools created:", 2);
    console.log("Devices created:", devices.length);
    console.log("Requests created:", 2);
    console.log("Reports created:", 2);

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedData();
