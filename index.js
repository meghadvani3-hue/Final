require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/chat');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Connect to Database
connectDB();

// Middlewares
app.use(cors(
  {
    origin:[
      'http://localhost:3000',
      'https://final-six-xi-35.vercel.app/'
    ],
    credentials: true
  }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.io Events
initSocket(io);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/payment', require('./routes/payment'));

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
