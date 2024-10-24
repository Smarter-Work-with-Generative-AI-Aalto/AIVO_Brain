import { Request, Response } from 'express';
import Queue from 'bull';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { getModelApiKey } from '../lib/apiKeys';

// Initialize Bull queue
const redisUrl = process.env.REDIS_URL || 'default_redis_url';
const researchQueue: Queue.Queue = new Queue('researchQueue', redisUrl);

// List of available AI models
const AVAILABLE_MODELS = ['AzureAI', 'OpenAI', 'AnthropicClaude', 'GoogleGemini', 'Mistral', 'Llama', 'Grok'];

/**
 * Enqueue a research request
 */
export const enqueueResearchRequest = async (req: Request, res: Response) => {
  try {
    const { documents, userSearchQuery, sequentialQuery, model } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'Documents are required and should be a non-empty array' });
    }

    if (!userSearchQuery || typeof userSearchQuery !== 'string') {
      return res.status(400).json({ error: 'User search query is required and should be a string' });
    }

    if (typeof sequentialQuery !== 'boolean') {
      return res.status(400).json({ error: 'Sequential query should be a boolean' });
    }

    if (!model || !AVAILABLE_MODELS.includes(model)) {
      return res.status(400).json({ error: `Model is required and should be one of: ${AVAILABLE_MODELS.join(', ')}` });
    }

    const modelApiKey = getModelApiKey(model);
    if (!modelApiKey) {
      return res.status(400).json({ error: `API key for model ${model} is not configured` });
    }

    const documentIds = await Promise.all(
      documents.map(async (doc: any) => {
        const newDoc = await prisma.document.create({
          data: {
            content: doc.content,
            metadata: doc.metadata || {},
          },
        });
        return newDoc.id;
      })
    );

    const newRequest = await prisma.aIRequestQueue.create({
      data: {
        model,
        documentIds,
        userSearchQuery,
        sequentialQuery,
        status: 'in queue',
      },
    });

    await researchQueue.add({ requestId: newRequest.id });

    res.status(200).json({ requestId: newRequest.id });
  } catch (error) {
    logger.error('Error enqueuing research request', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

/**
 * Get the status of a research request
 */
export const getResearchStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const request = await prisma.aIRequestQueue.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    logger.error('Error fetching research status', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
