import Queue from 'bull';
import { processResearchRequestQueue } from '../services/researchService';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

/**
 * Process research jobs from the queue
 */
export const researchJob = async (job: Queue.Job) => {
  const { requestId } = job.data;

  try {
    await processResearchRequestQueue(requestId);
    logger.info(`Successfully processed request ID: ${requestId}`);
  } catch (error) {
    logger.error(`Error processing request ID: ${requestId}`, error);
    // Optionally implement retry logic or failed job handling
    await prisma.aIRequestQueue.update({
      where: { id: requestId },
      data: { status: 'failed' },
    });
  }
};
