import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import contractRoutes from './routes/contracts.js';
import purchaseOrderRoutes from './routes/purchaseOrders.js';
import { startEmailScheduler } from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve React frontend in production
const clientPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientPath, 'index.html'));
});

// Start email scheduler
startEmailScheduler();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { prisma };
