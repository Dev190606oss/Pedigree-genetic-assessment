const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pedigree';
  
  // Try connecting to provided URI first
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] Connected to MongoDB at ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Direct MongoDB connection failed (${err.message}). Initializing embedded in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Connected to in-memory MongoDB instance at ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] Fatal error: Could not start in-memory MongoDB:`, memErr);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error('[Database] Disconnect error:', err);
  }
};

module.exports = { connectDB, disconnectDB };
