import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const trackingFilePath = path.join(__dirname, '../../data/tracking.json');

// Helper to read data
const readData = () => {
    try {
        const dataDir = path.dirname(trackingFilePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(trackingFilePath)) {
            return { users: {}, lastIdNumber: -1 };
        }
        const data = fs.readFileSync(trackingFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading tracking file:', err);
        return { users: {}, lastIdNumber: -1 };
    }
};

// Helper to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(trackingFilePath, JSON.stringify(data, null, 4), 'utf8');
    } catch (err) {
        console.error('Error writing tracking file:', err);
    }
};

export const handlePulse = async (req, res) => {
    const { userId, action } = req.body; // action: 'start' or 'heartbeat'
    let data = readData();
    let currentUserId = userId;
    const now = new Date();

    // If no userId, create a new one
    if (!currentUserId || !data.users[currentUserId]) {
        data.lastIdNumber += 1;
        currentUserId = `User_${data.lastIdNumber}`;
    }

    const userData = data.users[currentUserId] || {
        id: currentUserId,
        firstSeen: now.toISOString(),
        lastSeen: now.toISOString(),
        sessions: []
    };

    userData.lastSeen = now.toISOString();

    if (action === 'start') {
        // Check if the last session was very recent (less than 30 mins ago)
        const lastSession = userData.sessions[userData.sessions.length - 1];
        const thirtyMins = 30 * 60 * 1000;

        const isRecent = lastSession &&
            lastSession.endTime &&
            (now - new Date(lastSession.endTime)) < thirtyMins;

        if (!isRecent) {
            // Start a new session only if no recent one exists
            userData.sessions.push({
                startTime: now.toISOString(),
                endTime: now.toISOString(),
                duration: 0
            });
        }
    } else {
        // Heartbeat: Always update the last session
        let currentSession = userData.sessions[userData.sessions.length - 1];
        if (!currentSession) {
            currentSession = {
                startTime: now.toISOString(),
                endTime: now.toISOString(),
                duration: 0
            };
            userData.sessions.push(currentSession);
        }

        currentSession.endTime = now.toISOString();
        const start = new Date(currentSession.startTime);
        currentSession.duration = Math.floor((now - start) / 1000);
    }

    data.users[currentUserId] = userData;
    writeData(data);

    res.json({
        success: true,
        userId: currentUserId
    });
};

// Helper to check admin password
const checkAuth = (req) => {
    const password = req.headers['x-admin-password'];
    const actualPassword = process.env.ADMIN_PASSWORD || 'admin123';
    return password === actualPassword;
};

export const getReport = async (req, res) => {
    if (!checkAuth(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = readData();
    // Sort users by last seen
    const usersArray = Object.values(data.users).sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
    res.json(usersArray);
};

export const clearData = async (req, res) => {
    if (!checkAuth(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const emptyData = {
        users: {},
        lastIdNumber: -1
    };
    writeData(emptyData);
    res.json({ success: true, message: 'Tracking data cleared' });
};
