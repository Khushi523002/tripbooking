# ✈️ WanderQuest — MERN Stack Trip Booking App

A full-stack trip booking website with React frontend, Express/Node backend, and MongoDB Atlas database.

---

## 📁 Project Structure

```
trip-booking/
├── backend/          ← Express + Node.js API
│   ├── models/       ← Mongoose schemas (User, Trip, Booking)
│   ├── routes/       ← API routes
│   ├── middleware/   ← JWT auth middleware
│   ├── server.js     ← Entry point
│   └── .env.example  ← Copy to .env and fill in values
└── frontend/         ← React app (CRA)
    └── src/
        ├── pages/    ← Home, Trips, TripDetail, Login, Register, MyBookings
        ├── components/ ← Navbar, TripCard
        ├── context/  ← AuthContext
        └── utils/    ← Axios API calls
```

---

## 🗄️ STEP 1 — Setup MongoDB Atlas (Free Cloud DB)

1. Go to **https://cloud.mongodb.com** and create a free account
2. Click **"Build a Database"** → Choose **"FREE" (M0 Shared)** → Select region (Mumbai/ap-south-1)
3. Set a username & password (remember these!)
4. Under **"Network Access"**: Click "Add IP Address" → **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Under **"Database"**: Click **"Connect"** → **"Connect your application"**
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Add your DB name before `?`:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/tripbooking?retryWrites=true&w=majority
   ```

---

## 🔧 STEP 2 — Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and paste your MongoDB URI + set a JWT secret

npm run dev     # Development (nodemon)
# OR
npm start       # Production
```

Your backend runs at: **http://localhost:5000**

### Seed demo trips (run once after backend starts):
```
POST http://localhost:5000/api/trips/seed/demo
```
You can call this from browser or Postman.

---

## 💻 STEP 3 — Frontend Setup

```bash
cd frontend
npm install
npm start
```

Your frontend runs at: **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in package.json routes `/api` calls to backend automatically.

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login & get token |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/trips | ❌ | Get all trips (filterable) |
| GET | /api/trips/:id | ❌ | Get single trip |
| POST | /api/trips/seed/demo | ❌ | Seed sample data |
| POST | /api/bookings | ✅ | Create booking |
| GET | /api/bookings/my | ✅ | Get user's bookings |
| PUT | /api/bookings/:id/cancel | ✅ | Cancel booking |

---

## 🚀 Deployment Guide

### Backend → Render.com (Free)
1. Push to GitHub
2. Go to render.com → New → Web Service
3. Connect your repo → Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add Environment Variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`

### Frontend → Vercel (Free)
1. Go to vercel.com → Import Project
2. Root directory: `frontend`
3. Add env var: `REACT_APP_API_URL=https://your-render-backend.onrender.com/api`
4. Deploy!

---

## 🛠 Tech Stack

- **Frontend**: React 18, React Router v6, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, JWT Auth, bcryptjs
- **Database**: MongoDB Atlas (cloud), Mongoose ODM
