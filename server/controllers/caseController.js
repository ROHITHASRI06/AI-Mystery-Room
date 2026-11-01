import mongoose from 'mongoose';
import CaseModel from '../models/Case.js';
import { generateMystery } from '../services/geminiService.js';
import { DIFFICULTY_CONFIG } from '../utils/difficulty.js';
import { calculateFinalScore } from '../utils/scoring.js';
import { ApiError } from '../utils/ApiError.js';
import { serializePublicCase, serializeResult } from '../utils/serializers.js';

function findCaseOrThrow(caseDocument) {
  if (!caseDocument) throw new ApiError(404, 'Case not found.', 'CASE_NOT_FOUND');
  return caseDocument;
}

function assertActive(caseDocument) {
  if (caseDocument.status !== 'active') {
    throw new ApiError(409, 'This case has already been completed.', 'CASE_COMPLETED');
  }
}

export function validateCaseId(caseId) {
  if (!mongoose.isValidObjectId(caseId)) {
    throw new ApiError(400, 'The case ID is invalid.', 'INVALID_CASE_ID');
  }
}

export function createCreateCaseHandler({ generateMysteryFn = generateMystery, caseModel = CaseModel } = {}) {
  return async function createCase(request, response) {
    const { premise, difficulty } = request.body;
    const generated = await generateMysteryFn({ premise, difficulty });
    const { solution, ...publicCaseData } = generated;

    const caseDocument = await caseModel.create({
      ...publicCaseData,
      premise,
      difficulty,
      culpritId: solution.culpritId,
      solutionExplanation: solution.solutionExplanation,
      reasoning: solution.reasoning,
      clueConnections: solution.clueConnections,
      finalSolution: solution.finalSolution,
      remainingHints: DIFFICULTY_CONFIG[difficulty].hints,
      discoveredClueIds: [],
      usedHintIds: [],
      status: 'active',
    });

    response.status(201).json({ case: serializePublicCase(caseDocument) });
  };
}

export function createInvestigationHandlers({ caseModel = CaseModel } = {}) {
  async function getCase(request, response) {
    const caseDocument = findCaseOrThrow(await caseModel.findById(request.params.id));
    response.json({ case: serializePublicCase(caseDocument) });
  }

  async function discoverClue(request, response) {
    const caseDocument = findCaseOrThrow(await caseModel.findById(request.params.id));
    assertActive(caseDocument);

    const clue = caseDocument.clues.find((item) => item.clueId === request.params.clueId);
    if (!clue) throw new ApiError(404, 'Clue not found in this case.', 'CLUE_NOT_FOUND');

    const updatedCase = await caseModel.findOneAndUpdate(
      { _id: caseDocument._id, status: 'active', discoveredClueIds: { $ne: clue.clueId } },
      { $addToSet: { discoveredClueIds: clue.clueId } },
      { new: true },
    );

    const latestCase = updatedCase || findCaseOrThrow(await caseModel.findById(caseDocument._id));
    assertActive(latestCase);
    const alreadyDiscovered = !updatedCase;
    if (alreadyDiscovered && !latestCase.discoveredClueIds.includes(clue.clueId)) {
      throw new ApiError(409, 'The clue could not be discovered. Please try again.', 'CLUE_DISCOVERY_CONFLICT');
    }

    response.json({
      clue: { clueId: clue.clueId, title: clue.title, category: clue.category, description: clue.description, relevance: clue.relevance },
      alreadyDiscovered,
      discoveredClueCount: new Set(latestCase.discoveredClueIds).size,
    });
  }

  async function requestHint(request, response) {
    let caseDocument = findCaseOrThrow(await caseModel.findById(request.params.id));
    assertActive(caseDocument);
    const hintLimit = DIFFICULTY_CONFIG[caseDocument.difficulty]?.hints;
    if (hintLimit === undefined) throw new ApiError(500, 'Case difficulty is invalid.', 'INVALID_CASE_DIFFICULTY');

    for (let attempt = 0; attempt <= hintLimit; attempt += 1) {
      if (new Set(caseDocument.usedHintIds).size >= hintLimit || caseDocument.remainingHints <= 0) {
        throw new ApiError(409, 'No hints remain for this case.', 'NO_HINTS_REMAINING');
      }

      const hint = caseDocument.hints.find((item) => !caseDocument.usedHintIds.includes(item.hintId));
      if (!hint) throw new ApiError(409, 'No hints remain for this case.', 'NO_HINTS_REMAINING');

      const updatedCase = await caseModel.findOneAndUpdate(
        {
          _id: caseDocument._id,
          status: 'active',
          remainingHints: { $gt: 0 },
          usedHintIds: { $ne: hint.hintId },
        },
        { $addToSet: { usedHintIds: hint.hintId }, $inc: { remainingHints: -1 } },
        { new: true },
      );

      if (updatedCase) {
        response.json({ hint: { hintId: hint.hintId, text: hint.text }, hintsRemaining: updatedCase.remainingHints });
        return;
      }

      caseDocument = findCaseOrThrow(await caseModel.findById(request.params.id));
      assertActive(caseDocument);
    }

    throw new ApiError(409, 'No hints remain for this case.', 'NO_HINTS_REMAINING');
  }

  async function submitAccusation(request, response) {
    const caseDocument = findCaseOrThrow(await caseModel.findById(request.params.id).select('+culpritId'));
    assertActive(caseDocument);

    const accused = caseDocument.suspects.find((suspect) => suspect.suspectId === request.body.suspectId);
    if (!accused) throw new ApiError(400, 'The selected suspect does not belong to this case.', 'INVALID_SUSPECT');

    const isCorrect = accused.suspectId === caseDocument.culpritId;
    const finalScore = calculateFinalScore({
      difficulty: caseDocument.difficulty,
      isCorrect,
      discoveredClueCount: new Set(caseDocument.discoveredClueIds).size,
      hintsUsed: new Set(caseDocument.usedHintIds).size,
    });

    const completedCase = await caseModel.findOneAndUpdate(
      {
        _id: caseDocument._id,
        status: 'active',
        discoveredClueIds: caseDocument.discoveredClueIds,
        usedHintIds: caseDocument.usedHintIds,
      },
      {
        $set: {
          accusedSuspectId: accused.suspectId,
          isCorrect,
          finalScore,
          status: 'completed',
          completedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).select('+culpritId +solutionExplanation +reasoning +clueConnections +finalSolution');

    if (!completedCase) {
      const latestCase = findCaseOrThrow(await caseModel.findById(caseDocument._id).select('status'));
      assertActive(latestCase);
      throw new ApiError(409, 'The accusation could not be submitted. Please try again.', 'ACCUSATION_CONFLICT');
    }

    response.json({ result: serializeResult(completedCase) });
  }

  async function getResult(request, response) {
    const caseDocument = findCaseOrThrow(await caseModel.findById(request.params.id)
      .select('+culpritId +solutionExplanation +reasoning +clueConnections +finalSolution'));
    if (caseDocument.status !== 'completed') {
      throw new ApiError(409, 'The result is available after the final accusation.', 'CASE_NOT_COMPLETED');
    }

    response.json({ result: serializeResult(caseDocument) });
  }

  return { getCase, discoverClue, requestHint, submitAccusation, getResult };
}

export const { getCase, discoverClue, requestHint, submitAccusation, getResult } = createInvestigationHandlers();
