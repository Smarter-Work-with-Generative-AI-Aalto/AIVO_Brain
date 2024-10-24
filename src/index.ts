import express from 'express';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import researchRoutes from './routes/researchRoutes';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Queue from 'bull';
import { researchJob } from './jobs/researchJob';
import { logger } from './utils/logger';
import apiKeyMiddleware from './middlewares/apiKeyMiddleware';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Bull queue
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL is not defined');
}
const researchQueue = new Queue('researchQueue', redisUrl);

// Process jobs
researchQueue.process(researchJob);

// Setup Bull Board for monitoring
const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(researchQueue)],
  serverAdapter,
});
serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

// Apply API Key Middleware to all routes except Bull Board
app.use('/api', (req, res, next) => {
  apiKeyMiddleware(req, res, (err) => {
    if (err) return next(err);
    next();
  });
});

// Routes
app.use('/api/research', researchRoutes);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`AIVO Brain running on port ${PORT}`);
});

const cleanup = () => {
  logger.info('Cleaning up...');
  // Close database connections
  prisma.$disconnect();
  // Close Redis connections
  researchQueue.close();
  process.exit(0);
};

// Handle cleanup on different signals
process.on('SIGINT', cleanup);  // Ctrl+C
process.on('SIGTERM', cleanup); // Kill
process.on('SIGUSR2', cleanup); // Nodemon restart

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});
