import express from "express";
import Device from "../models/Device.js";
import School from "../models/School.js";

const router = express.Router();

// Get all devices with optional filtering
router.get("/", async (req, res) => {
  try {
    const { status, deviceType, assignedTo } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (deviceType) filter.deviceType = deviceType;
    if (assignedTo) filter.assignedTo = assignedTo;

    const devices = await Device.find(filter);
    
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get device by ID
router.get("/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) return res.status(404).json({ message: "Device not found" });
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new device
router.post("/", async (req, res) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json(device);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation
      res.status(400).json({ message: "Serial number already exists" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update device
router.put("/:id", async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() }
    );
    
    if (!device) return res.status(404).json({ message: "Device not found" });
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign device to school
router.post("/:id/assign", async (req, res) => {
  try {
    const { schoolId } = req.body;
    const school = await School.findById(schoolId);
    
    if (!school) return res.status(404).json({ message: "School not found" });
    
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: schoolId, 
        assignedDate: new Date(),
        status: "Assigned",
        updatedAt: new Date()
      }
    );
    
    if (!device) return res.status(404).json({ message: "Device not found" });
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unassign device
router.post("/:id/unassign", async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: null, 
        assignedDate: null,
        status: "Available",
        updatedAt: new Date()
      }
    );
    
    if (!device) return res.status(404).json({ message: "Device not found" });
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete device
router.delete("/:id", async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    
    if (!device) return res.status(404).json({ message: "Device not found" });
    
    res.json({ message: "Device deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
