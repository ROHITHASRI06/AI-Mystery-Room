import { Router } from 'express';
import { z } from 'zod';
import {
  createCreateCaseHandler,
  createInvestigationHandlers,
  validateCaseId,
} from '../controllers/caseController.js';
import CaseModel from '../models/Case.js';
import { generateMystery } from '../services/geminiService.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const createCaseSchema = z.object({
  premise: z.string().trim().min(1, 'Premise is required.').max(1000, 'Premise must be 1000 characters or fewer.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
}).strict();

const accusationSchema = z.object({
  suspectId: z.string().trim().regex(/^suspect_[1-9]\d*$/, 'suspectId must use the suspect_N format.'),
}).strict();

function validateRouteIds(request, _response, next) {
  try {
    validateCaseId(request.params.id);
    if (request.params.clueId !== undefined && !/^clue_[1-9]\d*$/.test(request.params.clueId)) {
      throw new ApiError(400, 'The clue ID is invalid.', 'INVALID_CLUE_ID');
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function createCaseRouter({
  generateMysteryFn = generateMystery,
  caseModel = CaseModel,
  databaseMiddleware = requireDatabase,
} = {}) {
  const router = Router();
  const investigationHandlers = createInvestigationHandlers({ caseModel });

  router.post('/', validateRequest(createCaseSchema), databaseMiddleware, asyncHandler(createCreateCaseHandler({ generateMysteryFn, caseModel })));
  router.get('/:id', validateRouteIds, databaseMiddleware, asyncHandler(investigationHandlers.getCase));
  router.post('/:id/clues/:clueId/discover', validateRouteIds, databaseMiddleware, asyncHandler(investigationHandlers.discoverClue));
  router.post('/:id/hints', validateRouteIds, databaseMiddleware, asyncHandler(investigationHandlers.requestHint));
  router.post('/:id/accuse', validateRouteIds, validateRequest(accusationSchema), databaseMiddleware, asyncHandler(investigationHandlers.submitAccusation));
  router.get('/:id/result', validateRouteIds, databaseMiddleware, asyncHandler(investigationHandlers.getResult));

  return router;
}

export default createCaseRouter();
