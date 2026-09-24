require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const familyRoutes = require('./routes/familyRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const counselorRoutes = require('./routes/counselorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'PEDIGREE Preconception Genetic Assessment',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/counselor', counselorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend static build if present
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// SPA Fallback for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      console.log(`[Pedigree Server] Running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('[Pedigree Server] Database initialization error:', err);
    process.exit(1);
  });
}

module.exports = { app, server };
