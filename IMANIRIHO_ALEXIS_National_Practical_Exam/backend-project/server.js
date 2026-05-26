const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/car');
const parkingSlotRoutes = require('./routes/parkingSlot');
const parkingRecordRoutes = require('./routes/parkingRecord');
const paymentRoutes = require('./routes/payment');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// CORS - must be before everything
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'smartpark-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: 'Unauthorized. Please login.' });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', requireAuth, carRoutes);
app.use('/api/parking-slots', requireAuth, parkingSlotRoutes);
app.use('/api/parking-records', requireAuth, parkingRecordRoutes);
app.use('/api/payments', requireAuth, paymentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React frontend static files
app.use(express.static(path.join(__dirname, '../frontend-project/dist')));

// All non-API routes serve React app
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend-project/dist/index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB - PSSMS database');

    const User = require('./models/User');
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      const admin = new User({ username: 'admin', password: 'Admin@2025' });
      await admin.save();
      console.log('Default admin user created: admin / Admin@2025');
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
