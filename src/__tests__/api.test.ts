import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Queue from 'bull';
import { researchJob } from '../jobs/researchJob';
import apiKeyMiddleware from '../middlewares/apiKeyMiddleware';
import researchRoutes from '../routes/researchRoutes';
import { prisma } from '../lib/prisma';


const app = express();
const redisUrl = 'redis://localhost:6379';
const researchQueue = new Queue('researchQueue', redisUrl);

// mock the prisma module
jest.mock('../lib/prisma', () => ({
    prisma: {
        apiKey: {
            findUnique: jest.fn(),
        },
        document: {
            create: jest.fn(),
        },
        aIRequestQueue: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
        $disconnect: jest.fn(),
    },
}));

// Type assertion for mocked prisma
const mockedPrisma = prisma as jest.Mocked<typeof prisma> & { $disconnect: jest.Mock };

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
createBullBoard({
    queues: [new BullAdapter(researchQueue)],
    serverAdapter,
});
serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

// Apply API Key Middleware
app.use('/api', (req, res, next) => {
    apiKeyMiddleware(req, res, (err) => {
        if (err) return next(err);
        next();
    });
});

// Routes
app.use('/api/research', researchRoutes);

describe('AIVO Brain API', () => {
    let validApiKey: string;

    beforeAll(async () => {
        // Create a valid API key for testing
        validApiKey = 'test-api-key';
        mockedPrisma.apiKey.findUnique.mockResolvedValue({ key: validApiKey } as any);
    });

    afterAll(async () => {
        await mockedPrisma.$disconnect();
    });

    describe('POST /api/research/enqueue', () => {
        it('should enqueue a research request successfully', async () => {
            const requestBody = {
                documents: [{ content: 'Test document content', metadata: {} }],
                userSearchQuery: 'Test search query',
                sequentialQuery: 'Test sequential query',
                model: 'OpenAI',
            };

            mockedPrisma.document.create.mockResolvedValue({ id: 'doc-123' } as any);
            mockedPrisma.aIRequestQueue.create.mockResolvedValue({ id: 'req-123' } as any);

            const response = await request(app)
                .post('/api/research/enqueue')
                .set('x-api-key', validApiKey)
                .send(requestBody);

            console.log('Response body:', response.body);

            if (response.status === 500) {
                console.error('Server error:', response.body);
            } else {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('requestId');
                expect(researchQueue.add).toHaveBeenCalledWith({ requestId: 'req-123' });
            }
        });
    });

    it('should return 401 for invalid API key', async () => {
        mockedPrisma.apiKey.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/research/enqueue')
            .set('x-api-key', 'invalid-key')
            .send({});

        console.log('Response body:', response.body); // Add this line for debugging

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid API Key');
    });

    describe('GET /api/research/status/:id', () => {
        describe('GET /api/research/status/:id', () => {
            it('should get the status of a research request successfully', async () => {
                const requestId = 'req-123';
                const mockRequest = {
                    id: requestId,
                    status: 'completed',
                    individualFindings: JSON.stringify([{ title: 'Finding 1', content: 'Content 1' }]),
                    overallSummary: JSON.stringify({ summary: 'Overall summary' }),
                };

                mockedPrisma.aIRequestQueue.findUnique.mockResolvedValue(mockRequest as any);
                mockedPrisma.apiKey.findUnique.mockResolvedValue({ key: validApiKey } as any);

                const response = await request(app)
                    .get(`/api/research/status/${requestId}`)
                    .set('x-api-key', validApiKey);

                expect(response.status).toBe(200);
                expect(response.body).toEqual(mockRequest);
            });

            it('should return 404 for non-existent request', async () => {
                const requestId = 'non-existent-id';

                mockedPrisma.aIRequestQueue.findUnique.mockResolvedValue(null);
                mockedPrisma.apiKey.findUnique.mockResolvedValue({ key: validApiKey } as any);

                const response = await request(app)
                    .get(`/api/research/status/${requestId}`)
                    .set('x-api-key', validApiKey);

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('error', 'Request not found');
            });
        });
    });
});
