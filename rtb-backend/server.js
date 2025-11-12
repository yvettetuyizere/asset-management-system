import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db/connection.js";
import initDatabase from "./db/init.js";
import authRoutes from "./routes/auth.js"; 
import deviceRoutes from "./routes/devices.js";
import schoolRoutes from "./routes/schools.js";
import requestRoutes from "./routes/requests.js";
import reportRoutes from "./routes/reports.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Initialize database schema
initDatabase()
  .then(() => console.log("PostgreSQL database initialized"))
  .catch(err => console.error("Database initialization error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reports", reportRoutes);

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
