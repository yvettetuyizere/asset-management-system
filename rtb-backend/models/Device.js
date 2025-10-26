import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  deviceType: { 
    type: String, 
    enum: ["Laptop", "Projector", "Desktop", "Tablet", "Printer", "Other"], 
    required: true 
  },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  specifications: {
    processor: String,
    ram: String,
    storage: String,
    screenSize: String,
    resolution: String,
    other: String
  },
  status: { 
    type: String, 
    enum: ["Available", "Assigned", "Damaged", "Under Repair", "Retired"], 
    default: "Available" 
  },
  condition: { 
    type: String, 
    enum: ["Excellent", "Good", "Fair", "Poor", "Damaged"], 
    default: "Good" 
  },
  purchaseDate: { type: Date },
  warrantyExpiry: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  assignedDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Device || mongoose.model("Device", deviceSchema);
