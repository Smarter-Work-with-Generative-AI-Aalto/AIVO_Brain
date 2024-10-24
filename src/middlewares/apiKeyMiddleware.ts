import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

/**
 * Middleware to authenticate API requests using API keys
 */
const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey) {
    logger.warn('Missing API Key');
    return res.status(401).json({ error: 'API Key is missing' });
  }

  logger.info(`Attempting to verify API key: ${apiKey}`); 

  prisma.apiKey.findUnique({
    where: { key: apiKey },
  })
  .then(keyRecord => {
    if (!keyRecord) {
      logger.warn('Invalid API Key', { apiKey });
      return res.status(401).json({ error: 'Invalid API Key' });
    }
    logger.info('API key verified successfully');
    next();
  })
  .catch(error => {
    logger.error('Error verifying API Key', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
};

export default apiKeyMiddleware;
