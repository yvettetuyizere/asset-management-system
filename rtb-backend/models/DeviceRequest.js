import mongoose from "mongoose";

const deviceRequestSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deviceType: { 
    type: String, 
    enum: ["Laptop", "Projector", "Desktop", "Tablet", "Printer", "Other"], 
    required: true 
  },
  quantity: { type: Number, required: true, min: 1 },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Urgent"], 
    default: "Medium" 
  },
  reason: { type: String, required: true },
  specifications: {
    processor: String,
    ram: String,
    storage: String,
    screenSize: String,
    other: String
  },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected", "Fulfilled"], 
    default: "Pending" 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewNotes: { type: String },
  approvedDate: { type: Date },
  fulfilledDate: { type: Date },
  assignedDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.DeviceRequest || mongoose.model("DeviceRequest", deviceRequestSchema);
