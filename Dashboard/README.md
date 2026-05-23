# 📊 ElectroAI Administration Dashboard

This dashboard is a private management tool used to monitor and track user activity on the **ElectroAI** platform. It provides real-time insights into how users interact with the circuit simulator.

## 🔐 Security Features

The dashboard is designed with a **Security-First** approach to ensure that only authorized personnel can access sensitive tracking data:

- **Password Protection**: Access is restricted via an Admin Password challenge. All requests to the backend require a valid `x-admin-password` header.
- **Environment Driven**: The admin password is never hardcoded but managed via the server's `.env` variables.
- **Obfuscated Endpoints**: The communication between the dashboard and the server uses non-standard, obfuscated API routes to prevent unauthorized discovery.
- **Secure Local Session**: The admin password is encrypted/managed securely in the browser's local storage for a seamless yet safe session experience.

## 🚀 Key Tracking Capabilities

- **User Activity Pulse**: Real-time tracking of online/offline status (Pulse System).
- **Session Analysis**: Detailed breakdown of each user session, including start time, end time, and total active duration.
- **Engagement Stats**: Monitor total users, active sessions, and peak usage times.
- **Data Life-Cycle**: Admins have the ability to securely clear logs when necessary.

## 🛠️ Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Styling**: Modern, responsive CSS with glassmorphism effects and font-awesome icons.
- **Backend API**: Node.js/Express analytics controller.

---

Crafted with ❤️ by **Mazen Ahmed** — *MERN Stack Developer*.
