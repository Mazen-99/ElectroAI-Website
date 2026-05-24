import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import aiRoutes from "./src/routes/aiRoutes.js";
import trackingRoutes from "./src/routes/trackingRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl) or if origin is in allowedOrigins
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-password"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); 

// Serve Dashboard Static Files
app.use("/dashboard", express.static(path.join(__dirname, "Dashboard")));


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
