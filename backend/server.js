import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.js';
import rfpRoutes from './routes/rfps.js';
import vendorRoutes from './routes/vendors.js';
import proposalRoutes from './routes/proposals.js';
import comparisonRoutes from './routes/comparison.js';

// Import new services
import { sequelize } from './models/index.js';
import redis, { cacheService } from './config/redis.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { startEmailWorker } from './workers/emailWorker.js';
import { startAIWorkers } from './workers/aiWorker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/comparison', comparisonRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RFP Management System API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: sequelize.getDatabaseName(),
      redis: redis.status,
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database: Connected to PostgreSQL');

    // Initialize RabbitMQ
    await connectRabbitMQ();

    // Start workers
    await startEmailWorker();
    await startAIWorkers();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
