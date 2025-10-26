// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  role: { type: String, enum: ["Admin", "Staff", "Headteacher"], required: true },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
