const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Create HTTP server for Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-monitoring', () => {
    socket.join('monitoring-room');
    console.log(`User joined global monitoring room: ${socket.id}`);
  });

  socket.on('exam-alert', (data) => {
    // Broadcast to specific exam room
    io.to(data.examId).emit('student-alert', data);
    // Also broadcast to global monitoring room
    io.to('monitoring-room').emit('student-alert', data);
  });

  socket.on('video-frame', (data) => {
    io.to('monitoring-room').emit('video-frame', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Mount routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/exams', require('./routes/exams'));
app.use('/api/v1/subjects', require('./routes/subjects'));
app.use('/api/v1/questions', require('./routes/questions'));
app.use('/api/v1/results', require('./routes/results'));
app.use('/api/v1/logs', require('./routes/logs'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/api/v1/organizations', require('./routes/organizations'));


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
