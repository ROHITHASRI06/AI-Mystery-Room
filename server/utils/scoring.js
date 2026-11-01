import { DIFFICULTY_CONFIG } from './difficulty.js';

export function calculateFinalScore({ difficulty, isCorrect, discoveredClueCount, hintsUsed }) {
  if (!isCorrect) return 0;

  const baseScore = DIFFICULTY_CONFIG[difficulty]?.baseScore;
  if (baseScore === undefined) throw new RangeError(`Unsupported difficulty: ${difficulty}`);

  return Math.max(0, baseScore + (5 * discoveredClueCount) - (10 * hintsUsed));
}
