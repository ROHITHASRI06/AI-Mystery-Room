import { z } from 'zod';
import { DIFFICULTY_CONFIG } from '../utils/difficulty.js';

const nonEmptyText = (label, max = 2000) => z.string().trim().min(1, `${label} is required.`).max(max);

const timelineEntrySchema = z.object({
  time: nonEmptyText('Timeline time', 120),
  event: nonEmptyText('Timeline event', 500),
}).strict();

const suspectSchema = z.object({
  suspectId: z.string().regex(/^suspect_[1-9]\d*$/),
  name: nonEmptyText('Suspect name', 120),
  age: z.number().int().min(18).max(120),
  occupation: nonEmptyText('Suspect occupation', 160),
  description: nonEmptyText('Suspect description'),
  relationshipWithVictim: nonEmptyText('Suspect relationship', 300),
  motive: nonEmptyText('Suspect motive', 700),
  alibi: nonEmptyText('Suspect alibi', 700),
  statement: nonEmptyText('Suspect statement', 1000),
}).strict();

const clueSchema = z.object({
  clueId: z.string().regex(/^clue_[1-9]\d*$/),
  title: nonEmptyText('Clue title', 120),
  description: nonEmptyText('Clue description', 1000),
  category: nonEmptyText('Clue category', 80),
  relevance: nonEmptyText('Clue relevance', 700),
}).strict();

const hintSchema = z.object({
  hintId: z.string().regex(/^hint_[1-9]\d*$/),
  text: nonEmptyText('Hint text', 500),
}).strict();

const clueConnectionSchema = z.object({
  clueId: z.string().regex(/^clue_[1-9]\d*$/),
  explanation: nonEmptyText('Clue connection', 700),
}).strict();

export function buildMysterySchema(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) throw new RangeError(`Unsupported difficulty: ${difficulty}`);

  return z.object({
    title: nonEmptyText('Case title', 160),
    crimeDescription: nonEmptyText('Crime description'),
    backgroundStory: nonEmptyText('Background story'),
    victim: z.object({
      name: nonEmptyText('Victim name', 120),
      age: z.number().int().min(0).max(120),
      occupation: nonEmptyText('Victim occupation', 160),
      details: nonEmptyText('Victim details', 1000),
    }).strict(),
    location: nonEmptyText('Crime location', 200),
    timeline: z.array(timelineEntrySchema).min(3).max(12),
    suspects: z.array(suspectSchema).length(config.suspects),
    clues: z.array(clueSchema).length(config.clues),
    hints: z.array(hintSchema).length(config.hints),
    solution: z.object({
      culpritId: z.string().regex(/^suspect_[1-9]\d*$/),
      solutionExplanation: nonEmptyText('Solution explanation'),
      reasoning: nonEmptyText('Solution reasoning'),
      clueConnections: z.array(clueConnectionSchema).length(config.clues),
      finalSolution: nonEmptyText('Final solution'),
    }).strict(),
  }).strict().superRefine((mystery, context) => {
    const suspectIds = mystery.suspects.map(({ suspectId }) => suspectId);
    const clueIds = mystery.clues.map(({ clueId }) => clueId);
    const hintIds = mystery.hints.map(({ hintId }) => hintId);
    const connectionIds = mystery.solution.clueConnections.map(({ clueId }) => clueId);

    for (const [label, ids] of [['suspect', suspectIds], ['clue', clueIds], ['hint', hintIds], ['clue connection', connectionIds]]) {
      if (new Set(ids).size !== ids.length) {
        context.addIssue({ code: 'custom', message: `${label} IDs must be unique.` });
      }
    }

    if (!suspectIds.includes(mystery.solution.culpritId)) {
      context.addIssue({ code: 'custom', path: ['solution', 'culpritId'], message: 'Culprit must match one of the generated suspects.' });
    }

    if (connectionIds.length !== clueIds.length || clueIds.some((clueId) => !connectionIds.includes(clueId))) {
      context.addIssue({ code: 'custom', path: ['solution', 'clueConnections'], message: 'Every clue must have exactly one solution connection.' });
    }
  });
}

export function buildMysteryJsonSchema(difficulty) {
  const jsonSchema = z.toJSONSchema(buildMysterySchema(difficulty));
  delete jsonSchema.$schema;
  return jsonSchema;
}
