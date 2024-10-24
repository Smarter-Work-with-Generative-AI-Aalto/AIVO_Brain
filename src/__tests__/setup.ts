import { jest } from '@jest/globals';

jest.mock('../lib/prisma');
jest.mock('../jobs/researchJob');
jest.mock('../utils/logger');