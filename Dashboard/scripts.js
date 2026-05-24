const API_URL = 'https://electroai-back-end.up.railway.app'; // Change to your railway URL after deployment
// My Back-end URL: https://electroai-website.vercel.app
const refreshBtn = document.getElementById('refreshBtn');
const clearBtn = document.getElementById('clearBtn');
const userTableBody = document.getElementById('userTableBody');
const sessionModal = document.getElementById('sessionModal');

let adminPassword = localStorage.getItem('admin_password');
const authOverlay = document.getElementById('authOverlay');
const authBtn = document.getElementById('authBtn');

const unlockDashboard = () => {
    document.body.style.visibility = 'visible';
    authOverlay.style.display = 'none';
};

const handleAuth = () => {
    const pass = prompt('Please enter Admin Password:');
    if (pass) {
        adminPassword = pass;
        fetchData();
    }
};

authBtn.addEventListener('click', handleAuth);

async function fetchData() {
    if (!adminPassword) return;

    const icon = refreshBtn.querySelector('i');
    icon.classList.add('spinning');

    try {
        const response = await fetch(`${API_URL}/api/analytics/report-stats-v5`, {
            headers: { 'x-admin-password': adminPassword }
        });

        if (response.status === 401) {
            localStorage.removeItem('admin_password');
            adminPassword = null;
            alert('Incorrect password.');
            return;
        }

        // Save on success
        localStorage.setItem('admin_password', adminPassword);
        unlockDashboard();

        const users = await response.json();
        allUsersData = users;

        renderStats(users);
        renderTable(users);

        document.getElementById('lastUpdated').innerText = new Date().toLocaleTimeString();
    } catch (err) {
        console.error('Failed to fetch data:', err);
        userTableBody.innerHTML = `<tr><td colspan="6" class="no-data" style="color: #ef4444;">Error connecting to server. Check if backend is running.</td></tr>`;
    } finally {
        setTimeout(() => icon.classList.remove('spinning'), 500);
    }
}

async function clearAllData() {
    if (!confirm('Are you sure you want to clear all tracking data? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/api/analytics/clear-auth-logs-z11`, {
            method: 'POST',
            headers: { 'x-admin-password': adminPassword }
        });
        const res = await response.json();
        if (res.success) {
            fetchData();
        }
    } catch (err) {
        alert('Failed to clear data');
    }
}

function renderStats(users) {
    document.getElementById('totalUsers').innerText = users.length;

    let totalSessions = 0;
    let activeNow = 0;
    const now = new Date();

    users.forEach(u => {
        totalSessions += u.sessions.length;
        const lastSeen = new Date(u.lastSeen);
        if ((now - lastSeen) < 120000) {
            activeNow++;
        }
    });

    document.getElementById('totalSessions').innerText = totalSessions;
    document.getElementById('activeNow').innerText = activeNow;
}

function renderTable(users) {
    if (users.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="6" class="no-data">No users tracked yet.</td></tr>`;
        return;
    }

    const now = new Date();
    userTableBody.innerHTML = users.map(user => {
        const totalDuration = user.sessions.reduce((acc, s) => acc + s.duration, 0);
        const lastSeenDate = new Date(user.lastSeen);
        const isOnline = (now - lastSeenDate) < 120000;

        return `
            <tr onclick="showSessions('${user.id}')" style="cursor:pointer;" class="user-row">
                <td><span class="user-id">${user.id}</span></td>
                <td>
                    <span class="status-badge ${isOnline ? 'status-online' : 'status-offline'}">
                        <i class="fa-solid fa-circle" style="font-size: 0.4rem;"></i>
                        ${isOnline ? 'Online' : 'Offline'}
                    </span>
                </td>
                <td>
                    <span style="background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:8px; font-size:0.8rem;">
                        ${user.sessions.length} sessions
                    </span>
                </td>
                <td>
                    <div class="time-info">${new Date(user.firstSeen).toLocaleDateString()}</div>
                    <div style="font-size: 0.7rem;">${new Date(user.firstSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td>
                    <div class="time-info">${lastSeenDate.toLocaleDateString()}</div>
                    <div style="font-size: 0.7rem;">${lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style="font-weight: 800; color:var(--accent);">${formatDuration(totalDuration)}</td>
            </tr>
        `;
    }).join('');
}

function showSessions(userId) {
    const user = allUsersData.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('modalTitle').innerText = `History for ${userId}`;
    const content = document.getElementById('modalContent');

    content.innerHTML = user.sessions.slice().reverse().map((session, index) => {
        const start = new Date(session.startTime);
        return `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:16px; padding:16px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:0.7rem; text-transform:uppercase; font-weight:800; color:var(--text-secondary);">Session ${user.sessions.length - index}</span>
                    <span style="font-size:0.8rem; font-weight:600; color:var(--accent);">${formatDuration(session.duration)}</span>
                </div>
                <div style="display:flex; gap:15px; font-size:0.9rem;">
                    <div>
                        <div style="font-size:0.7rem; color:var(--text-secondary);">Started</div>
                        <div>${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <i class="fa-solid fa-arrow-right" style="margin-top:15px; font-size:0.7rem; opacity:0.3;"></i>
                    <div>
                        <div style="font-size:0.7rem; color:var(--text-secondary);">Last Pulse</div>
                        <div>${session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active Now'}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    sessionModal.style.display = 'flex';
}

function closeModal() {
    sessionModal.style.display = 'none';
}

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ${seconds % 60}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
}

refreshBtn.addEventListener('click', fetchData);
clearBtn.addEventListener('click', clearAllData);
window.onclick = (event) => { if (event.target == sessionModal) closeModal(); }

setInterval(fetchData, 30000);
fetchData();
