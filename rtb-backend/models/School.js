import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  sector: { type: String, required: true },
  headteacher: {
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.School || mongoose.model("School", schoolSchema);
