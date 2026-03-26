# Personal Finance Tracker+

A complete 3-tier web application for tracking personal finances, managing budgets, and getting AI-powered spending insights.

## Project Structure
This repository contains three separate services:
1. **Frontend**: Next.js 14, Recharts, Tailwind CSS (Dark Theme)
2. **Backend**: Node.js, Express, MongoDB, SQLite (for monthly reports)
3. **Python Service**: Flask, Pandas (for spending analysis)

---

## Test Credentials
The database seed script automatically creates these users for testing:
- **User**: `vineet@fintracker.com` / `Vineet@123` (Has 60 seeded expenses & budgets)
- **Admin**: `admin@example.com` / `admin123`

---

## Prerequisites
- Node.js (v18+)
- Python (v3.12+)
- MongoDB Atlas (Cloud) or Local MongoDB

---

## Quick Start (Run Locally)

### 1. Backend API (Node + Express)
```bash
cd backend
npm install
npm run seed     # Creates Vineet Singh user and 60 random expenses
npm run dev      # Starts server on port 5001
```

### 2. Python Microservice (Pandas Analyzer)
```bash
cd python-service
# Use the automated script for Windows:
.\start_ai.bat   # Installs dependencies and starts on port 8000
```

### 3. Frontend App (Next.js)
```bash
cd frontend
npm install
npm run dev      # Starts Next.js on port 3000
```

Now open [http://localhost:3000](http://localhost:3000) and login with `vineet@fintracker.com` / `Vineet@123`.

---

## Deployment Guide

### 1. GitHub Push
Ensure you have a `.gitignore` at the root (one has been created for you).
```bash
git init
git add .
git commit -m "Final submission: 3-tier Finance Tracker+"
# Add your repo URL
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Frontend (Vercel)
- Connect your GitHub repo.
- **Root Directory**: `frontend`
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Env Vars**: 
  - `NEXT_PUBLIC_API_URL`: Your Render Backend URL + `/api`
  - `NEXT_PUBLIC_PYTHON_API_URL`: Your Render Python URL

### 3. Backend (Render)
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Env Vars**: Set all variables from `.env.example`.

### 4. Python AI (Render)
- **Root Directory**: `python-service`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python app.py`

---

## Core Features Implemented
- **Secure Auth**: JWT short-lived Access Tokens + 7-day HTTP-Only Refresh Tokens
- **Expense Tracking**: Full CRUD with search, category filtering, and pagination
- **Smart Budgets**: Set monthly category limits with real-time progress bars showing 80%+ alerts
- **Dashboard**: Advanced data visualization using MongoDB `$facet` aggregation
- **Monthly Reports**: Generated automatically via `node-cron` on the 1st of every month, stored in **SQLite**
- **AI Analysis**: Pandas-powered microservice generating instant insights on spending habits

---

## API Endpoints Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Expenses (Protected)
- `GET    /api/expenses`
- `POST   /api/expenses`
- `PUT    /api/expenses/:id`
- `DELETE /api/expenses/:id`

### Budgets (Protected)
- `GET  /api/budgets`
- `POST /api/budgets`
- `GET  /api/budgets/alerts`

### Reports & Dashboard (Protected)
- `GET  /api/dashboard/summary`
- `GET  /api/reports`
- `POST /api/reports/generate`

### Python Microservice
- `POST /analyze` (Receives expenses/budgets array, returns insights)
