export function serializePublicCase(caseDocument) {
  const discoveredIds = new Set(caseDocument.discoveredClueIds || []);

  return {
    id: String(caseDocument._id),
    premise: caseDocument.premise,
    difficulty: caseDocument.difficulty,
    title: caseDocument.title,
    crimeDescription: caseDocument.crimeDescription,
    backgroundStory: caseDocument.backgroundStory,
    victim: caseDocument.victim,
    location: caseDocument.location,
    timeline: caseDocument.timeline,
    suspects: caseDocument.suspects,
    clues: caseDocument.clues.map((clue) => ({
      clueId: clue.clueId,
      title: clue.title,
      category: clue.category,
      discovered: discoveredIds.has(clue.clueId),
      ...(discoveredIds.has(clue.clueId) ? { description: clue.description, relevance: clue.relevance } : {}),
    })),
    discoveredClueCount: discoveredIds.size,
    hintsRemaining: caseDocument.remainingHints,
    hintsUsed: new Set(caseDocument.usedHintIds || []).size,
    status: caseDocument.status,
    createdAt: caseDocument.createdAt,
    updatedAt: caseDocument.updatedAt,
  };
}

export function serializeResult(caseDocument) {
  return {
    caseId: String(caseDocument._id),
    caseTitle: caseDocument.title,
    status: caseDocument.status,
    accusedSuspectId: caseDocument.accusedSuspectId,
    accusedSuspect: caseDocument.suspects.find((suspect) => suspect.suspectId === caseDocument.accusedSuspectId)?.name,
    culpritId: caseDocument.culpritId,
    culprit: caseDocument.suspects.find((suspect) => suspect.suspectId === caseDocument.culpritId)?.name,
    isCorrect: caseDocument.isCorrect,
    solutionExplanation: caseDocument.solutionExplanation,
    reasoning: caseDocument.reasoning,
    clueConnections: caseDocument.clueConnections,
    finalSolution: caseDocument.finalSolution,
    discoveredClueCount: new Set(caseDocument.discoveredClueIds || []).size,
    hintsUsed: new Set(caseDocument.usedHintIds || []).size,
    finalScore: caseDocument.finalScore,
    completedAt: caseDocument.completedAt,
  };
}
