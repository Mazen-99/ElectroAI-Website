import express from 'express';
import { handlePulse, getReport, clearData } from '../controllers/trackingController.js';

const router = express.Router();

// Hidden endpoints
router.post('/pulse-log-data-x92', handlePulse); 
router.get('/report-stats-v5', getReport);
router.post('/clear-auth-logs-z11', clearData);

export default router;
