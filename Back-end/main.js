import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./src/routes/aiRoutes.js";
import trackingRoutes from "./src/routes/trackingRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Proper CORS Configuration using FRONTEND_URL
const corsOptions = {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-password"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Supporting large circuit JSONs

// Routes
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", trackingRoutes);


// Simple Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root Route
app.get("/", (req, res) => {
    res.send("🚀 ElectroAI Back-end System is Running");
});

// Start Server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 ElectroAI Back-end System is Running`);
    console.log(`PORT: ${PORT} ✅`)
    console.log(`========================================`);
});

export default app;
