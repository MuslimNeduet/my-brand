import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (_req, res) => {
  const state = mongoose.connection.readyState; // 1 = connected
  res.json({
    dbConnected: state === 1,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host
  });
});

export default router;