# Smart Queue Management

A decoupled, enterprise-grade full-stack web application for real-time queue orchestration, WebSockets synchronization, and AI-driven wait time predictions.

---

## 🏗️ System Architecture & Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend API**: Python 3.11, FastAPI, SQLAlchemy ORM, WebSockets, JWT Auth (`pbkdf2_sha256`)
- **Database**: PostgreSQL (with automatic SQLite development fallback)
- **ML Microservice**: Python, Scikit-Learn (`RandomForestRegressor`), Pandas, NumPy, FastAPI

---

## 📁 Project Structure

```
smart-queue-management/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # UI components (HealthCard, Navbar, etc.)
│   │   ├── pages/        # Application view pages (Customer, Staff, Admin)
│   │   ├── contexts/     # Auth & Toast Notification Contexts
│   │   ├── services/     # Axios API service clients
│   │   ├── hooks/        # Custom React hooks (useHealthCheck, etc.)
│   │   └── types/        # TypeScript interfaces & API types
│   ├── index.html
│   └── package.json
├── backend/              # Python FastAPI + SQLAlchemy + WebSockets + JWT
│   ├── app/
│   │   ├── main.py       # FastAPI main entrypoint & WS endpoints
│   │   ├── database/     # DB connection engine & seed.py script
│   │   ├── models/       # SQLAlchemy models (User, Location, Queue, etc.)
│   │   ├── routers/      # REST API Routers (auth, customer, staff, admin, etc.)
│   │   ├── services/     # Queue Engine & Notification Services
│   │   ├── websocket/    # Real-time WebSocket connection manager
│   │   └── ml/           # ML Microservice HTTP client
│   └── requirements.txt
└── ml-service/           # AI/ML Microservice (RandomForestRegressor)
    ├── app/
    │   ├── main.py       # ML API server (`POST /predict`, `POST /train`)
    │   ├── predictor.py  # Wait time prediction & confidence scoring
    │   └── trainer.py    # Model training pipeline
    └── requirements.txt
```

---

## 🚀 Quick Start Guide: Exact Commands

### 1. Database Setup (PostgreSQL / SQLite)

#### PostgreSQL Setup:
```bash
# Connect to PostgreSQL CLI and create database
psql -U postgres -c "CREATE DATABASE smart_queue_db;"
```

#### Database Schema & Historical Data Seeding:
```bash
cd backend

# (Optional) Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Run seed script (creates tables, initial admin/staff/customers, and 1,000+ historical records)
python -m app.database.seed
```

---

### 2. FastAPI Backend Server

```bash
cd backend

# Ensure virtual environment is active
# On Windows: venv\Scripts\activate

# Start Backend Server on Port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Real-Time WebSocket Endpoint**: `ws://127.0.0.1:8000/ws/queue/{queue_id}`

---

### 3. ML Waiting-Time Microservice

```bash
cd ml-service

# (Optional) Create virtual environment
python -m venv venv
# On Windows: venv\Scripts\activate

# Install ML dependencies
pip install -r requirements.txt

# Start ML Prediction Microservice on Port 8001
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
- **ML Service Docs**: `http://127.0.0.1:8001/docs`

---

### 4. React Frontend Web App

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server
npm run dev
```
- **Web App Interface**: `http://localhost:5173`

---

## 🧪 Automated Verification & Testing

To run the complete suite of integration tests and error handling verifications:

```bash
# 1. Run End-to-End Customer -> Staff -> WebSockets -> Admin Integration Test
python scratch/test_e2e_flow.py

# 2. Run Exhaustive Error & Edge Cases Test Suite
python scratch/test_error_cases.py
```

### Verified Test Cases:
1. **Full Customer Journey**: Registration, Login, Location & Service browsing, Queue joining, Token allocation (`GO-011`), Live Queue tracking.
2. **Staff Console Flow**: Login, queue inspection, `CALL NEXT`, `START SERVICE`, `COMPLETE SERVICE`.
3. **Real-time WebSockets**: Automated event broadcasts (`CUSTOMER_CALLED`, `QUEUE_UPDATED`, `NOTIFICATION`) without page refreshes.
4. **Admin Analytics**: Recharts visualizers powered by real SQL queries (`Overview`, `Queue Volume by Hour`, `Wait Times by SLA`).
5. **Duplicate Ticket Prevention**: Returns `400 Bad Request` if user attempts to join a second active queue.
6. **Cancellation Handling**: Marks ticket `CANCELLED`, notifies user, and automatically recalculates wait times for remaining waiting customers.
7. **ML Service Downtime Fallback**: Seamlessly falls back to deterministic formula `(people_ahead * avg_service_time) / active_counters` if ML server is unreachable.
