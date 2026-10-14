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
const expertSystemRoutes = require('./routes/expertSystemRoutes');

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
    platform: 'GeneTrace Preconception Genetic Assessment & Guidance Platform',
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
app.use('/api/expert-system', expertSystemRoutes);

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

const PORT = process.env.PORT || 5001;

async function ensureDemoUsers() {
  try {
    const bcrypt = require('bcryptjs');
    const { User } = require('./models');
    const salt = await bcrypt.genSalt(10);
    const userHash = await bcrypt.hash('User@123', salt);
    const counselorHash = await bcrypt.hash('Counselor@123', salt);
    const adminHash = await bcrypt.hash('Admin@123', salt);

    const demoAccounts = [
      { email: 'user@genetrace.local', name: 'Alex Morgan', role: 'USER', passwordHash: userHash },
      { email: 'counselor@genetrace.local', name: 'Dr. Sarah Chen, MS, CGC', role: 'COUNSELOR', passwordHash: counselorHash },
      { email: 'admin@genetrace.local', name: 'GeneTrace Administrator', role: 'ADMIN', passwordHash: adminHash },
      { email: 'user@pedigree.local', name: 'Alex Morgan', role: 'USER', passwordHash: userHash },
      { email: 'counselor@pedigree.local', name: 'Dr. Sarah Chen, MS, CGC', role: 'COUNSELOR', passwordHash: counselorHash },
      { email: 'admin@pedigree.local', name: 'System Administrator', role: 'ADMIN', passwordHash: adminHash }
    ];

    for (const acc of demoAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create({
          name: acc.name,
          email: acc.email,
          passwordHash: acc.passwordHash,
          role: acc.role,
          isActive: true
        });
      }
    }
  } catch (err) {
    console.error('[GeneTrace] Error ensuring demo users:', err.message);
  }
}

let server = null;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    await ensureDemoUsers();
    server = app.listen(PORT, () => {
      console.log(`[GeneTrace Server] Running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('[GeneTrace Server] Database initialization error:', err);
    process.exit(1);
  });
}

module.exports = { app, server };
