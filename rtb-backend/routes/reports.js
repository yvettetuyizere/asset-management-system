import express from "express";
import IssueReport from "../models/IssueReport.js";

const router = express.Router();

// Get all reports with optional filtering
router.get("/", async (req, res) => {
  try {
    const { status, school, issueType, severity } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (school) filter.school = school;
    if (issueType) filter.issueType = issueType;
    if (severity) filter.severity = severity;

    const reports = await IssueReport.find(filter)
      .populate("school", "name province district")
      .populate("reportedBy", "email")
      .populate("assignedTo", "email")
      .populate("device", "serialNumber deviceType brand model")
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get report by ID
router.get("/:id", async (req, res) => {
  try {
    const report = await IssueReport.findById(req.params.id)
      .populate("school", "name province district headteacher")
      .populate("reportedBy", "email")
      .populate("assignedTo", "email")
      .populate("device", "serialNumber deviceType brand model specifications");
    
    if (!report) return res.status(404).json({ message: "Report not found" });
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new report
router.post("/", async (req, res) => {
  try {
    const report = new IssueReport(req.body);
    await report.save();
    
    const populatedReport = await IssueReport.findById(report._id)
      .populate("school", "name province district")
      .populate("reportedBy", "email")
      .populate("device", "serialNumber deviceType brand model");
    
    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update report status
router.put("/:id/status", async (req, res) => {
  try {
    const { status, assignedTo, resolution } = req.body;
    
    const updateData = {
      status,
      assignedTo,
      resolution,
      updatedAt: new Date()
    };
    
    if (status === "Resolved" || status === "Closed") {
      updateData.resolvedDate = new Date();
    }
    
    const report = await IssueReport.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("school", "name province district")
     .populate("reportedBy", "email")
     .populate("assignedTo", "email")
     .populate("device", "serialNumber deviceType brand model");
    
    if (!report) return res.status(404).json({ message: "Report not found" });
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete report
router.delete("/:id", async (req, res) => {
  try {
    const report = await IssueReport.findByIdAndDelete(req.params.id);
    
    if (!report) return res.status(404).json({ message: "Report not found" });
    
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
