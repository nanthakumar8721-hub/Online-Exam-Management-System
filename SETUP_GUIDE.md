# Setup Guide: Online Exam Management System

## Prerequisites
- Node.js (v16+)
- MongoDB (Running locally on port 27017 or Cloud URI)

## Installation

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` file (copy from `.env` template):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/exam-system
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=24h
   ```
4. `node server.js`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Access at `http://localhost:5173`

## Default Credentials (Recommended for initial setup)
1. Register a user at `/register`.
2. Access your MongoDB collection `users` and change the `role` field to `admin` or `staff` as needed for testing those dashboards.

## Features implemented
- Real-time tab switch detection
- Automatic grading
- Responsive layout
- JWT based protection
