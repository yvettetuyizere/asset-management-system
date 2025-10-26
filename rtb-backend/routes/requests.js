import express from "express";
import DeviceRequest from "../models/DeviceRequest.js";
import Device from "../models/Device.js";

const router = express.Router();

// Get all requests with optional filtering
router.get("/", async (req, res) => {
  try {
    const { status, school, deviceType } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (school) filter.school = school;
    if (deviceType) filter.deviceType = deviceType;

    const requests = await DeviceRequest.find(filter)
      .populate("school", "name province district")
      .populate("requestedBy", "email")
      .populate("reviewedBy", "email")
      .populate("assignedDevices")
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get request by ID
router.get("/:id", async (req, res) => {
  try {
    const request = await DeviceRequest.findById(req.params.id)
      .populate("school", "name province district headteacher")
      .populate("requestedBy", "email")
      .populate("reviewedBy", "email")
      .populate("assignedDevices");
    
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new request
router.post("/", async (req, res) => {
  try {
    const request = new DeviceRequest(req.body);
    await request.save();
    
    const populatedRequest = await DeviceRequest.findById(request._id)
      .populate("school", "name province district")
      .populate("requestedBy", "email");
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request status (approve/reject)
router.put("/:id/status", async (req, res) => {
  try {
    const { status, reviewNotes, reviewedBy } = req.body;
    
    const updateData = {
      status,
      reviewNotes,
      reviewedBy,
      updatedAt: new Date()
    };
    
    if (status === "Approved") {
      updateData.approvedDate = new Date();
    }
    
    const request = await DeviceRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("school", "name province district")
     .populate("requestedBy", "email")
     .populate("reviewedBy", "email");
    
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fulfill request (assign devices)
router.post("/:id/fulfill", async (req, res) => {
  try {
    const { deviceIds } = req.body;
    
    const request = await DeviceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    if (request.status !== "Approved") {
      return res.status(400).json({ message: "Request must be approved first" });
    }
    
    // Check if devices are available
    const devices = await Device.find({ 
      _id: { $in: deviceIds },
      status: "Available"
    });
    
    if (devices.length !== deviceIds.length) {
      return res.status(400).json({ message: "Some devices are not available" });
    }
    
    // Assign devices to school
    await Device.updateMany(
      { _id: { $in: deviceIds } },
      { 
        assignedTo: request.school,
        assignedDate: new Date(),
        status: "Assigned",
        updatedAt: new Date()
      }
    );
    
    // Update request
    const updatedRequest = await DeviceRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Fulfilled",
        assignedDevices: deviceIds,
        fulfilledDate: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate("school", "name province district")
     .populate("assignedDevices");
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete request
router.delete("/:id", async (req, res) => {
  try {
    const request = await DeviceRequest.findByIdAndDelete(req.params.id);
    
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
