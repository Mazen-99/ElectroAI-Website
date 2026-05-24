import express from 'express';
import { generateCircuit } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/generate-circuit
router.post('/generate-circuit', generateCircuit);

// GET /api/ai/health
router.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'ai' }));

export default router;
