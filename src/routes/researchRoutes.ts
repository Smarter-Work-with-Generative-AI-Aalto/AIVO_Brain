import express from 'express';
import {
  enqueueResearchRequest,
  getResearchStatus,
} from '../controllers/researchController';

const router = express.Router();

/**
 * @route POST /api/research/enqueue
 * @desc Enqueue a research request
 * @access Protected
 */
router.post('/enqueue', async (req, res, next) => {
  try {
    await enqueueResearchRequest(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/research/status/:id
 * @desc Get the status of a research request
 * @access Protected
 */
router.get('/status/:id', async (req, res, next) => {
  try {
    await getResearchStatus(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
