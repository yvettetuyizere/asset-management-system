import express from "express";
import School from "../models/School.js";

const router = express.Router();

// Get all schools
router.get("/", async (req, res) => {
  try {
    const { province, district, sector } = req.query;
    const filter = {};
    
    if (province) filter.province = province;
    if (district) filter.district = district;
    if (sector) filter.sector = sector;

    const schools = await School.find(filter);
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get school by ID
router.get("/:id", async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    
    if (!school) return res.status(404).json({ message: "School not found" });
    
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new school
router.post("/", async (req, res) => {
  try {
    const school = await School.create(req.body);
    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update school
router.put("/:id", async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() }
    );
    
    if (!school) return res.status(404).json({ message: "School not found" });
    
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete school
router.delete("/:id", async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    
    if (!school) return res.status(404).json({ message: "School not found" });
    
    res.json({ message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get school statistics
router.get("/:id/stats", async (req, res) => {
  try {
    const Device = (await import("../models/Device.js")).default;
    
    const totalDevices = await Device.countDocuments({ assignedTo: req.params.id });
    const devicesByType = await Device.aggregate([
      { $match: { assignedTo: req.params.id } },
      { $group: { _id: "$deviceType", count: { $sum: 1 } } }
    ]);
    
    const devicesByStatus = await Device.aggregate([
      { $match: { assignedTo: req.params.id } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalDevices,
      devicesByType,
      devicesByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
