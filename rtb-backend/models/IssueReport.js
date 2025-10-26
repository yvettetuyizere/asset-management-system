import mongoose from "mongoose";

const issueReportSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  device: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
  issueType: { 
    type: String, 
    enum: ["Hardware Failure", "Software Issue", "Physical Damage", "Performance Issue", "Other"], 
    required: true 
  },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Critical"], 
    default: "Medium" 
  },
  status: { 
    type: String, 
    enum: ["Reported", "Under Investigation", "In Progress", "Resolved", "Closed"], 
    default: "Reported" 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolution: { type: String },
  resolvedDate: { type: Date },
  attachments: [{ type: String }], // URLs to uploaded files/images
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.IssueReport || mongoose.model("IssueReport", issueReportSchema);
