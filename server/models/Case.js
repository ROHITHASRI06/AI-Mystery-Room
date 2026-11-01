import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const victimSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0 },
    occupation: { type: String, trim: true },
    details: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const timelineEntrySchema = new Schema(
  {
    time: { type: String, required: true, trim: true },
    event: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const suspectSchema = new Schema(
  {
    suspectId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    occupation: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    relationshipWithVictim: { type: String, required: true, trim: true },
    motive: { type: String, required: true, trim: true },
    alibi: { type: String, required: true, trim: true },
    statement: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const clueSchema = new Schema(
  {
    clueId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    relevance: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const hintSchema = new Schema(
  {
    hintId: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const clueConnectionSchema = new Schema(
  {
    clueId: { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const caseSchema = new Schema(
  {
    premise: { type: String, required: true, trim: true, maxlength: 1000 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    title: { type: String, required: true, trim: true },
    crimeDescription: { type: String, required: true, trim: true },
    backgroundStory: { type: String, required: true, trim: true },
    victim: { type: victimSchema, required: true },
    location: { type: String, required: true, trim: true },
    timeline: { type: [timelineEntrySchema], required: true },
    suspects: { type: [suspectSchema], required: true, validate: (items) => items.length > 0 },
    clues: { type: [clueSchema], required: true, validate: (items) => items.length > 0 },
    hints: { type: [hintSchema], required: true },
    discoveredClueIds: { type: [String], default: [] },
    usedHintIds: { type: [String], default: [] },
    remainingHints: { type: Number, required: true, min: 0 },
    culpritId: { type: String, required: true, select: false },
    solutionExplanation: { type: String, required: true, select: false },
    reasoning: { type: String, required: true, select: false },
    clueConnections: { type: [clueConnectionSchema], required: true, select: false },
    finalSolution: { type: String, required: true, trim: true, select: false },
    status: { type: String, enum: ['active', 'completed'], default: 'active', required: true },
    accusedSuspectId: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    finalScore: { type: Number, default: null, min: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

caseSchema.index({ status: 1, createdAt: -1 });

const CaseModel = models.Case || model('Case', caseSchema);
export default CaseModel;
