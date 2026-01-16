require('dotenv').config(); // Must be first line
const path = require('path');
const fs = require('fs'); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const storeRouter = require('./routes/storeRouter');
const hostRouter = require('./routes/hostRouter');
const authRouter = require('./routes/authRouter');
const chatRouter = require('./routes/chatRouter'); // NEW
const setupSocket = require('./socket'); // NEW

const MONGODB_URI = process.env.MONGODB_URI; 

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup Socket.IO handlers
setupSocket(io);

// Make io accessible in routes
app.set('io', io);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Add this line to your backend/app.js after other middleware
// and before your routes:

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make sure to import path at the top:
// const path = require('path');
// Middleware


app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://next-js-and-typescript-git-570742-vipul-jains-projects-6162711b.vercel.app',
    'https://next-js-and-typescript-project-kwz8.vercel.app'
  ],
  credentials: true,
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRouter);  
app.use('/api', storeRouter); 
app.use('/api/host', hostRouter);
app.use('/api/chat', chatRouter); // NEW

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint Not Found', path: req.originalUrl });
});

// Error Handler
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  res.status(status).json({ message: message });
});

// MongoDB Connection and Server Start
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const port = process.env.PORT || 3500;
    server.listen(port, () => {
      console.log(`🔥 API Server live on Atlas & running at port ${port}`);
      console.log(`🔌 Socket.IO ready for connections`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });