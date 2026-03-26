# Finance Tracker+ 🚀

A premium 3-tier Personal Finance Management system featuring AI-driven insights, persistent cloud storage, and a stunning dark-mode Glassmorphism interface.

## 🔗 Live Application
- **Live App**: [https://finance-tracker-puce-mu.vercel.app](https://finance-tracker-puce-mu.vercel.app)
- **API Server**: [https://finance-tracker-backend-hwqy.onrender.com](https://finance-tracker-backend-hwqy.onrender.com)
- **AI Service**: [https://finance-tracker-ai-6p00.onrender.com](https://finance-tracker-ai-6p00.onrender.com)

## 🔑 Test Credentials
Use these to explore the pre-seeded data:
- **Email**: `vineet@fintracker.com`
- **Password**: `Vineet@123`

---

## ✨ Key Features
- **3-Tier Architecture**: Scalable separation of Frontend (Next.js), Backend (Node.js), and AI Analysis (Python).
- **AI Smart Insights**: Integration with a Python/Flask microservice for financial velocity and spending patterns.
- **Persistent Cloud Storage**: Powered by **MongoDB Atlas** for secure, multi-user data persistence.
- **Premium UI/UX**: Modern dark-themed design with Glassmorphism effects and responsive layouts.
- **Interactive Data Visualization**: Real-time spending charts using Recharts.
- **Safe & Secure**: JWT-based authentication with auto-refresh tokens and secure cookie handling.

---

## 🏗️ Architecture
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide icons, Recharts.
- **Backend**: Node.js, Express, Mongoose, Zod, JWT.
- **AI Microservice**: Python, Flask, Pandas (Financial analysis).
- **Database**: MongoDB Atlas (Cloud) + SQLite (for monthly reporting snapshot caching).

---

## 🚀 Local Setup

### 1. Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
# Configure .env based on .env.example
npm run seed  # Seed initial data
npm run dev   # Start dev server
```

### 3. Python Service Setup
```bash
cd python-service
pip install -r requirements.txt
python app.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
# Configure .env.local based on .env.example
npm run dev
```

---

## 🛠️ Extra Features Added
1. **AI Velocity Analysis**: Uses Python to calculate how fast you are spending money compared to your average.
2. **Glassmorphism Design**: Custom CSS tokens for a premium "Apple-style" glass effect on cards and modals.
3. **Advanced Rate Limiting**: Protection against brute-force attacks on auth routes.
4. **Cloud Migration**: Successfully transitioned from local SQLite to a full cloud-based MongoDB Atlas cluster.

---
**Developed by Vineet Singh** 💎👑
