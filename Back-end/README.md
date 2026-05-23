# ⚙️ ElectroAI | Backend

The brain of the operation. This Node.js server handles complex AI processing and persistent user analytics.

## 🧠 Core Functions
- **AI Circuit Engine**: Integrates with Google Gemini API to translate natural language prompts into structured JSON circuit data.
- **Pulse Analytics**: A secure tracking system that monitors user sessions and engagement metrics.
- **Admin Guardian**: Protects sensitive analytics data using a secure password-based authentication layer.

## 🛠️ Stack
- **Node.js**: Runtime environment.
- **Express.js**: Web framework for high-speed API endpoints.
- **Google Generative AI**: Powering the circuit generation logic.
- **Dotenv**: Secure environment variable management.

## 🚀 Development
To start the backend:
```bash
npm install
npm run dev
```

## ⚙️ Environment Variables
Required keys in `.env`:
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `ADMIN_PASSWORD`: Secure password for the Dashboard access.
- `FRONTEND_URL`: The URL of your React application.
- `PORT`: (Optional) Defaults to 5000.

---

Crafted with ❤️ by **Mazen Ahmed** — *MERN Stack Developer*.
