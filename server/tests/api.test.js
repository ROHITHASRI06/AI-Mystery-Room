import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../app.js';
import CaseModel from '../models/Case.js';
import { serializePublicCase } from '../utils/serializers.js';
import { calculateFinalScore } from '../utils/scoring.js';
import { createGeminiService, GEMINI_REQUEST_TIMEOUT_MS } from '../services/geminiService.js';
import { configureDnsServers } from '../config/dns.js';

let server;
let baseUrl;

describe('DNS configuration', () => {
  it('does not override Node DNS when DNS_SERVERS is unset', () => {
    let configured = false;
    const resolver = { setServers() { configured = true; } };

    assert.equal(configureDnsServers('', resolver), false);
    assert.equal(configured, false);
  });

  it('parses and applies comma-separated DNS server IP addresses', () => {
    let configuredServers;
    const resolver = { setServers(servers) { configuredServers = servers; } };

    assert.equal(configureDnsServers(' 127.0.2.2, 127.0.2.3 ', resolver), true);
    assert.deepEqual(configuredServers, ['127.0.2.2', '127.0.2.3']);
  });

  it('rejects invalid DNS server values without changing resolver configuration', () => {
    let configured = false;
    const resolver = { setServers() { configured = true; } };

    assert.throws(() => configureDnsServers('dns.example.com', resolver), /comma-separated list of IP addresses/);
    assert.equal(configured, false);
  });
});

before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe('API foundation', () => {
  it('reports database state through the health endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      status: 'degraded',
      service: 'ai-mystery-room-api',
      database: 'disconnected',
    });
  });

  it('allows the configured local Vite origin through CORS', async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { origin: 'http://127.0.0.1:5173' },
    });
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5173');
  });

  it('returns a structured 404 for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error.code, 'ROUTE_NOT_FOUND');
  });

  it('rejects invalid JSON centrally', async () => {
    const response = await fetch(`${baseUrl}/api/cases`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{broken',
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'INVALID_JSON');
  });

  it('validates case creation input and rejects database-backed work while MongoDB is disconnected', async () => {
    const invalid = await fetch(`${baseUrl}/api/cases`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ premise: '  ', difficulty: 'easy' }),
    });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).error.code, 'VALIDATION_ERROR');

    const valid = await fetch(`${baseUrl}/api/cases`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ premise: 'A locked study mystery.', difficulty: 'easy' }),
    });
    assert.equal(valid.status, 503);
    assert.equal((await valid.json()).error.code, 'DATABASE_UNAVAILABLE');
  });

  it('rejects malformed case IDs before database access', async () => {
    const response = await fetch(`${baseUrl}/api/cases/not-an-object-id`);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'INVALID_CASE_ID');
  });

  it('omits hidden solution fields and undiscovered clue content from public cases', () => {
    const publicCase = serializePublicCase({
      _id: 'case-id',
      premise: 'A mystery',
      difficulty: 'easy',
      title: 'The Locked Study',
      crimeDescription: 'A crime',
      backgroundStory: 'A story',
      victim: { name: 'Avery', details: 'A victim' },
      location: 'Study',
      timeline: [],
      suspects: [{ suspectId: 'suspect_1', name: 'Morgan' }],
      clues: [
        { clueId: 'clue_1', title: 'Sealed Letter', category: 'document', description: 'Hidden text', relevance: 'Hidden meaning' },
        { clueId: 'clue_2', title: 'Mud', category: 'trace', description: 'Visible text', relevance: 'Visible meaning' },
      ],
      discoveredClueIds: ['clue_2'],
      usedHintIds: [],
      remainingHints: 2,
      status: 'active',
      culpritId: 'suspect_1',
      solutionExplanation: 'Private solution',
      reasoning: 'Private reasoning',
      clueConnections: ['Private connection'],
      finalSolution: 'Private ending',
    });

    assert.equal('culpritId' in publicCase, false);
    assert.equal('solutionExplanation' in publicCase, false);
    assert.equal('reasoning' in publicCase, false);
    assert.equal('clueConnections' in publicCase, false);
    assert.equal('finalSolution' in publicCase, false);
    assert.equal('description' in publicCase.clues[0], false);
    assert.equal(publicCase.clues[1].description, 'Visible text');
  });
});

describe('Case model', () => {
  it('validates the case shape and keeps solution paths excluded by default', async () => {
    const caseDocument = new CaseModel({
      premise: 'A locked study mystery.',
      difficulty: 'easy',
      title: 'The Locked Study',
      crimeDescription: 'A victim was found in the study.',
      backgroundStory: 'Three people had a motive.',
      victim: { name: 'Avery Vale', details: 'A wealthy publisher.' },
      location: 'Vale House',
      timeline: [{ time: '9:00 PM', event: 'The lights went out.' }],
      suspects: [{
        suspectId: 'suspect_1', name: 'Morgan Vale', age: 42, occupation: 'Editor',
        description: 'A close associate.', relationshipWithVictim: 'Business partner',
        motive: 'A disputed contract.', alibi: 'At the library.', statement: 'I heard nothing.',
      }],
      clues: [{ clueId: 'clue_1', title: 'A torn page', description: 'A page was torn.', category: 'document', relevance: 'It fixes the time.' }],
      hints: [{ hintId: 'hint_1', text: 'Compare the timelines.' }],
      remainingHints: 1,
      culpritId: 'suspect_1',
      solutionExplanation: 'The contract was the motive.',
      reasoning: 'The timeline disproves the alibi.',
      clueConnections: [{ clueId: 'clue_1', explanation: 'The timeline gap contradicts the alibi.' }],
      finalSolution: 'Morgan committed the crime.',
    });

    await caseDocument.validate();
    assert.equal(CaseModel.schema.path('culpritId').options.select, false);
    assert.equal(CaseModel.schema.path('solutionExplanation').options.select, false);
    assert.equal(CaseModel.schema.path('reasoning').options.select, false);
    assert.equal(CaseModel.schema.path('clueConnections').options.select, false);
    assert.equal(CaseModel.schema.path('finalSolution').options.select, false);
  });

  it('rejects unsupported difficulty values', async () => {
    const caseDocument = new CaseModel({ difficulty: 'extreme' });
    await assert.rejects(caseDocument.validate(), (error) => Boolean(error.errors.difficulty));
  });
});

describe('Scoring', () => {
  it('applies the correct accusation formula and gives zero for an incorrect accusation', () => {
    assert.equal(calculateFinalScore({ difficulty: 'easy', isCorrect: true, discoveredClueCount: 4, hintsUsed: 1 }), 110);
    assert.equal(calculateFinalScore({ difficulty: 'easy', isCorrect: true, discoveredClueCount: 0, hintsUsed: 0 }), 100);
    assert.equal(calculateFinalScore({ difficulty: 'medium', isCorrect: true, discoveredClueCount: 0, hintsUsed: 0 }), 150);
    assert.equal(calculateFinalScore({ difficulty: 'hard', isCorrect: true, discoveredClueCount: 0, hintsUsed: 0 }), 200);
    assert.equal(calculateFinalScore({ difficulty: 'hard', isCorrect: false, discoveredClueCount: 9, hintsUsed: 0 }), 0);
  });
});

function generatedMystery(difficulty) {
  const counts = {
    easy: { suspects: 3, clues: 5, hints: 2 },
    medium: { suspects: 4, clues: 7, hints: 3 },
    hard: { suspects: 5, clues: 9, hints: 3 },
  }[difficulty];

  const clues = Array.from({ length: counts.clues }, (_, index) => ({
    clueId: `clue_${index + 1}`,
    title: `Evidence ${index + 1}`,
    description: `A distinctive observation about the scene, item ${index + 1}.`,
    category: 'physical',
    relevance: `This clue helps reconstruct event ${index + 1}.`,
  }));

  return {
    title: `Case ${difficulty}`,
    crimeDescription: 'A victim was found after a carefully staged incident.',
    backgroundStory: 'A close circle of acquaintances each had a reason to conceal something.',
    victim: { name: 'Alex Vale', age: 55, occupation: 'Publisher', details: 'The owner of the estate.' },
    location: 'Vale House study',
    timeline: [
      { time: '8:00 PM', event: 'Guests arrived.' },
      { time: '8:30 PM', event: 'The victim met a visitor.' },
      { time: '9:00 PM', event: 'The incident was discovered.' },
    ],
    suspects: Array.from({ length: counts.suspects }, (_, index) => ({
      suspectId: `suspect_${index + 1}`,
      name: `Suspect ${index + 1}`,
      age: 30 + index,
      occupation: 'Estate associate',
      description: 'A person with access to the house.',
      relationshipWithVictim: 'Professional acquaintance',
      motive: 'A disagreement about an inheritance.',
      alibi: 'Claims to have been in the east wing.',
      statement: 'I did not enter the study that evening.',
    })),
    clues,
    hints: Array.from({ length: counts.hints }, (_, index) => ({
      hintId: `hint_${index + 1}`,
      text: `Compare the timing detail in step ${index + 1} with a suspect's account.`,
    })),
    solution: {
      culpritId: 'suspect_1',
      solutionExplanation: 'The first suspect had access and a concealed motive.',
      reasoning: 'The timeline and physical evidence contradict the first suspect’s account.',
      clueConnections: clues.map((clue) => ({ clueId: clue.clueId, explanation: clue.relevance })),
      finalSolution: 'The first suspect committed the crime and staged the locked room.',
    },
  };
}

describe('Gemini generation', () => {
  it('uses the 180-second provider timeout and logs only sanitized generation diagnostics', async () => {
    assert.equal(GEMINI_REQUEST_TIMEOUT_MS, 180_000);
    const events = [];
    const logger = {
      info: (message, details) => events.push({ level: 'info', message, details }),
      error: (message, details) => events.push({ level: 'error', message, details }),
    };
    const service = createGeminiService({
      getApiKey: () => 'private-test-key',
      getModel: () => 'gemini-test-model',
      logger,
      clientFactory: () => ({ models: { generateContent: async () => { throw Object.assign(new Error('private prompt and key detail'), { status: 429, code: 'RESOURCE_EXHAUSTED', cause: Object.assign(new Error('private cause'), { code: 'ECONNRESET' }) }); } } }),
    });

    await assert.rejects(service({ premise: 'A private premise.', difficulty: 'easy' }), (error) => error.code === 'GEMINI_REQUEST_FAILED');

    assert.equal(events.length, 2);
    assert.equal(events[0].message, 'Gemini mystery generation started');
    assert.equal(events[0].details.startedAt.length > 0, true);
    assert.equal(events[1].message, 'Gemini mystery generation failed');
    assert.equal(events[1].details.failureKind, 'provider_request');
    assert.equal(events[1].details.providerError.category, 'rate_limited');
    assert.equal(events[1].details.providerError.status, 429);
    assert.equal(events[1].details.providerError.causeCategory, 'network_reset');
    assert.equal(typeof events[1].details.completedAt, 'string');
    assert.equal(typeof events[1].details.elapsedMs, 'number');
    assert.equal(JSON.stringify(events).includes('private prompt and key detail'), false);
    assert.equal(JSON.stringify(events).includes('private cause'), false);
    assert.equal(JSON.stringify(events).includes('private-test-key'), false);
  });

  it('requests, parses, and validates exact counts for Easy, Medium, and Hard', async () => {
    const observedRequests = [];
    const service = createGeminiService({
      getApiKey: () => 'test-key',
      getModel: () => 'gemini-test-model',
      clientFactory: (apiKey) => {
        assert.equal(apiKey, 'test-key');
        return {
          models: {
            generateContent: async (request) => {
              observedRequests.push(request);
              const difficulty = request.contents.match(/Difficulty: (easy|medium|hard)/)?.[1];
              return { text: JSON.stringify(generatedMystery(difficulty)) };
            },
          },
        };
      },
    });

    for (const [difficulty, expected] of Object.entries({
      easy: { suspects: 3, clues: 5, hints: 2 },
      medium: { suspects: 4, clues: 7, hints: 3 },
      hard: { suspects: 5, clues: 9, hints: 3 },
    })) {
      const result = await service({ premise: 'A locked study after a storm.', difficulty });
      assert.equal(result.suspects.length, expected.suspects);
      assert.equal(result.clues.length, expected.clues);
      assert.equal(result.hints.length, expected.hints);
      assert.equal(result.solution.clueConnections.length, expected.clues);
    }

    assert.equal(observedRequests.length, 3);
    assert.ok(observedRequests.every((request) => request.config.responseMimeType === 'application/json'));
    assert.ok(observedRequests[0].contents.includes('exactly 3 suspects, 5 clues, and 2 progressively helpful hints'));
    assert.ok(observedRequests[2].contents.includes('exactly 5 suspects, 9 clues, and 3 progressively helpful hints'));
    assert.equal(observedRequests[0].config.responseJsonSchema.properties.suspects.minItems, 3);
    assert.equal(observedRequests[1].config.responseJsonSchema.properties.clues.maxItems, 7);
    assert.equal(observedRequests[2].config.responseJsonSchema.properties.hints.minItems, 3);
  });

  it('returns useful errors for an absent key, malformed JSON, and invalid generated data', async () => {
    const noKey = createGeminiService({ getApiKey: () => '' });
    await assert.rejects(noKey({ premise: 'A case.', difficulty: 'easy' }), (error) => error.code === 'GEMINI_NOT_CONFIGURED');

    const withText = (text) => createGeminiService({
      getApiKey: () => 'test-key',
      clientFactory: () => ({ models: { generateContent: async () => ({ text }) } }),
    });
    await assert.rejects(withText('{not json')({ premise: 'A case.', difficulty: 'easy' }), (error) => error.code === 'MALFORMED_GEMINI_RESPONSE');
    await assert.rejects(withText(JSON.stringify({ title: 'Incomplete' }))({ premise: 'A case.', difficulty: 'easy' }), (error) => error.code === 'INVALID_GENERATED_MYSTERY');

    const providerFailure = createGeminiService({
      getApiKey: () => 'test-key',
      clientFactory: () => ({ models: { generateContent: async () => { throw new Error('private provider detail'); } } }),
    });
    await assert.rejects(providerFailure({ premise: 'A case.', difficulty: 'easy' }), (error) => {
      assert.equal(error.code, 'GEMINI_REQUEST_FAILED');
      assert.equal(error.statusCode, 502);
      assert.equal(error.message.includes('private provider detail'), false);
      return true;
    });
  });

  it('creates active cases through POST /api/cases without returning hidden solution data', async () => {
    const createdDocuments = [];
    const caseModel = {
      async create(data) {
        const document = new CaseModel(data);
        await document.validate();
        createdDocuments.push(document);
        return document;
      },
    };
    const app = createApp({
      generateMysteryFn: async ({ difficulty }) => generatedMystery(difficulty),
      caseModel,
      databaseMiddleware: (_request, _response, next) => next(),
    });
    const testServer = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => testServer.once('listening', resolve));
    const url = `http://127.0.0.1:${testServer.address().port}/api/cases`;

    try {
      for (const [difficulty, expected] of Object.entries({
        easy: { suspects: 3, clues: 5 },
        medium: { suspects: 4, clues: 7 },
        hard: { suspects: 5, clues: 9 },
      })) {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ premise: 'A locked study after a storm.', difficulty }),
        });
        const body = await response.json();
        assert.equal(response.status, 201);
        assert.equal(body.case.difficulty, difficulty);
        assert.equal(body.case.suspects.length, expected.suspects);
        assert.equal(body.case.clues.length, expected.clues);
        assert.equal(body.case.hintsRemaining, difficulty === 'easy' ? 2 : 3);
        assert.equal('culpritId' in body.case, false);
        assert.equal('solutionExplanation' in body.case, false);
        assert.equal('finalSolution' in body.case, false);
        assert.equal('description' in body.case.clues[0], false);
      }

      assert.equal(createdDocuments.length, 3);
      assert.equal(createdDocuments[2].culpritId, 'suspect_1');
      assert.ok(createdDocuments[2].solutionExplanation);
    } finally {
      await new Promise((resolve, reject) => testServer.close((error) => error ? reject(error) : resolve()));
    }
  });
});

function memoryQuery(executor) {
  const query = {
    select() { return query; },
    then(resolve, reject) {
      return Promise.resolve().then(executor).then(resolve, reject);
    },
  };
  return query;
}

class MemoryCaseStore {
  constructor(documents) {
    this.documents = new Map(documents.map((document) => [document._id, document]));
  }

  async create(data) {
    const id = this.documents.size.toString(16).padStart(24, '0');
    const document = new CaseModel({ ...data, _id: id });
    await document.validate();
    const storedDocument = document.toObject();
    this.documents.set(id, storedDocument);
    return storedDocument;
  }

  findById(id) {
    return memoryQuery(() => this.documents.get(String(id)) || null);
  }

  findOneAndUpdate(filter, update) {
    return memoryQuery(() => {
      const document = this.documents.get(String(filter._id));
      if (!document || document.status !== filter.status) return null;

      for (const field of ['discoveredClueIds', 'usedHintIds']) {
        if (Array.isArray(filter[field]) && JSON.stringify(document[field]) !== JSON.stringify(filter[field])) return null;
      }

      const undiscoveredId = filter.discoveredClueIds?.$ne;
      if (undiscoveredId && document.discoveredClueIds.includes(undiscoveredId)) return null;

      const unusedHintId = filter.usedHintIds?.$ne;
      if (unusedHintId && document.usedHintIds.includes(unusedHintId)) return null;
      if (filter.remainingHints?.$gt !== undefined && document.remainingHints <= filter.remainingHints.$gt) return null;

      for (const [field, value] of Object.entries(update.$addToSet || {})) {
        if (!document[field].includes(value)) document[field].push(value);
      }
      for (const [field, amount] of Object.entries(update.$inc || {})) document[field] += amount;
      Object.assign(document, update.$set || {});
      return document;
    });
  }
}

function investigationCase(id, difficulty = 'easy', overrides = {}) {
  const { solution, ...publicData } = generatedMystery(difficulty);
  const hintLimit = { easy: 2, medium: 3, hard: 3 }[difficulty];
  return {
    ...publicData,
    _id: id,
    premise: 'A case premise.',
    difficulty,
    culpritId: solution.culpritId,
    solutionExplanation: solution.solutionExplanation,
    reasoning: solution.reasoning,
    clueConnections: solution.clueConnections,
    finalSolution: solution.finalSolution,
    discoveredClueIds: [],
    usedHintIds: [],
    remainingHints: hintLimit,
    status: 'active',
    accusedSuspectId: null,
    isCorrect: null,
    finalScore: null,
    completedAt: null,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('Investigation APIs', () => {
  const caseIds = {
    public: 'a'.repeat(24),
    clues: 'b'.repeat(24),
    easy: 'c'.repeat(24),
    medium: 'd'.repeat(24),
    hard: 'e'.repeat(24),
    correct: 'f'.repeat(24),
    incorrect: '1'.repeat(24),
    completed: '2'.repeat(24),
  };
  const records = [
    investigationCase(caseIds.public, 'easy', { discoveredClueIds: ['clue_2'] }),
    investigationCase(caseIds.clues),
    investigationCase(caseIds.easy, 'easy'),
    investigationCase(caseIds.medium, 'medium'),
    investigationCase(caseIds.hard, 'hard'),
    investigationCase(caseIds.correct, 'easy', {
      discoveredClueIds: ['clue_1', 'clue_2', 'clue_3', 'clue_4'],
      usedHintIds: ['hint_1'],
      remainingHints: 1,
    }),
    investigationCase(caseIds.incorrect, 'medium'),
    investigationCase(caseIds.completed, 'easy', { status: 'completed', accusedSuspectId: 'suspect_2', isCorrect: false, finalScore: 0 }),
  ];
  const store = new MemoryCaseStore(records);
  const app = createApp({
    caseModel: store,
    generateMysteryFn: async ({ difficulty }) => generatedMystery(difficulty),
    databaseMiddleware: (_request, _response, next) => next(),
  });
  let testServer;
  let testBaseUrl;

  before(async () => {
    testServer = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => testServer.once('listening', resolve));
    testBaseUrl = `http://127.0.0.1:${testServer.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => testServer.close((error) => error ? reject(error) : resolve()));
  });

  async function requestCase(id, path = '', init = {}) {
    return fetch(`${testBaseUrl}/api/cases/${id}${path}`, init);
  }

  it('returns case progress without any hidden solution fields', async () => {
    const response = await requestCase(caseIds.public);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.case.discoveredClueCount, 1);
    assert.equal(body.case.clues[0].discovered, false);
    assert.equal('description' in body.case.clues[0], false);
    assert.equal(body.case.clues[1].description, 'A distinctive observation about the scene, item 2.');
    for (const hiddenField of ['culpritId', 'solutionExplanation', 'reasoning', 'clueConnections', 'finalSolution']) {
      assert.equal(hiddenField in body.case, false);
    }
  });

  it('discovers clues once, handles repeated requests and rejects invalid or missing clues', async () => {
    const path = '/clues/clue_1/discover';
    const first = await requestCase(caseIds.clues, path, { method: 'POST' });
    const firstBody = await first.json();
    assert.equal(first.status, 200);
    assert.equal(firstBody.alreadyDiscovered, false);
    assert.equal(firstBody.discoveredClueCount, 1);
    assert.equal(firstBody.clue.description, 'A distinctive observation about the scene, item 1.');

    const repeat = await requestCase(caseIds.clues, path, { method: 'POST' });
    const repeatBody = await repeat.json();
    assert.equal(repeat.status, 200);
    assert.equal(repeatBody.alreadyDiscovered, true);
    assert.equal(repeatBody.discoveredClueCount, 1);

    const concurrentDiscoveries = await Promise.all([
      requestCase(caseIds.clues, '/clues/clue_2/discover', { method: 'POST' }),
      requestCase(caseIds.clues, '/clues/clue_2/discover', { method: 'POST' }),
    ]);
    const concurrentBodies = await Promise.all(concurrentDiscoveries.map((response) => response.json()));
    assert.deepEqual(concurrentBodies.map((body) => body.alreadyDiscovered).sort(), [false, true]);
    assert.deepEqual(concurrentBodies.map((body) => body.discoveredClueCount), [2, 2]);

    assert.equal((await requestCase(caseIds.clues, '/clues/clue_bad/discover', { method: 'POST' })).status, 400);
    assert.equal((await requestCase(caseIds.clues, '/clues/clue_99/discover', { method: 'POST' })).status, 404);
    assert.equal((await requestCase('3'.repeat(24), path, { method: 'POST' })).status, 404);
  });

  it('serves hints in order and enforces Easy, Medium and Hard limits', async () => {
    const parallelEasyHints = await Promise.all([
      requestCase(caseIds.easy, '/hints', { method: 'POST' }),
      requestCase(caseIds.easy, '/hints', { method: 'POST' }),
    ]);
    const parallelEasyBodies = await Promise.all(parallelEasyHints.map((response) => response.json()));
    assert.deepEqual(parallelEasyBodies.map((body) => body.hint.hintId).sort(), ['hint_1', 'hint_2']);
    assert.deepEqual(parallelEasyBodies.map((body) => body.hintsRemaining).sort(), [0, 1]);
    assert.equal((await requestCase(caseIds.easy, '/hints', { method: 'POST' })).status, 409);

    for (const [difficulty, id, limit] of [
      ['medium', caseIds.medium, 3],
      ['hard', caseIds.hard, 3],
    ]) {
      for (let index = 1; index <= limit; index += 1) {
        const response = await requestCase(id, '/hints', { method: 'POST' });
        const body = await response.json();
        assert.equal(response.status, 200);
        assert.equal(body.hint.hintId, `hint_${index}`);
        assert.equal(body.hintsRemaining, limit - index);
      }

      const exhausted = await requestCase(id, '/hints', { method: 'POST' });
      assert.equal(exhausted.status, 409);
      assert.equal((await exhausted.json()).error.code, 'NO_HINTS_REMAINING');
    }
  });

  it('scores correct accusations on the backend and reveals results only after completion', async () => {
    const activeResult = await requestCase(caseIds.correct, '/result');
    assert.equal(activeResult.status, 409);
    const activeResultBody = await activeResult.json();
    assert.equal('culpritId' in activeResultBody, false);
    assert.equal('solutionExplanation' in activeResultBody, false);

    const accusations = await Promise.all([
      requestCase(caseIds.correct, '/accuse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ suspectId: 'suspect_1' }),
      }),
      requestCase(caseIds.correct, '/accuse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ suspectId: 'suspect_1' }),
      }),
    ]);
    const accusation = accusations.find((response) => response.status === 200);
    const rejectedAccusation = accusations.find((response) => response.status === 409);
    const verdict = await accusation.json();
    assert.ok(rejectedAccusation);
    assert.equal(accusation.status, 200);
    assert.equal(verdict.result.isCorrect, true);
    assert.equal(verdict.result.finalScore, 110);
    assert.equal(verdict.result.culpritId, 'suspect_1');
    assert.ok(verdict.result.solutionExplanation);
    assert.ok(verdict.result.finalSolution);

    const result = await requestCase(caseIds.correct, '/result');
    assert.equal(result.status, 200);
    assert.equal((await result.json()).result.finalScore, 110);

    const completedPublicCase = await requestCase(caseIds.correct);
    const completedPublicBody = await completedPublicCase.json();
    assert.equal(completedPublicCase.status, 200);
    assert.equal('culpritId' in completedPublicBody.case, false);
    assert.equal('finalSolution' in completedPublicBody.case, false);
  });

  it('scores an incorrect accusation as zero and rejects later investigation actions', async () => {
    const accusation = await requestCase(caseIds.incorrect, '/accuse', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ suspectId: 'suspect_2' }),
    });
    const verdict = await accusation.json();
    assert.equal(accusation.status, 200);
    assert.equal(verdict.result.isCorrect, false);
    assert.equal(verdict.result.finalScore, 0);

    const repeatAccusation = await requestCase(caseIds.incorrect, '/accuse', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ suspectId: 'suspect_1' }),
    });
    assert.equal(repeatAccusation.status, 409);
    assert.equal((await repeatAccusation.json()).error.code, 'CASE_COMPLETED');

    assert.equal((await requestCase(caseIds.incorrect, '/clues/clue_1/discover', { method: 'POST' })).status, 409);
    assert.equal((await requestCase(caseIds.incorrect, '/hints', { method: 'POST' })).status, 409);
  });

  it('rejects invalid suspect IDs, unknown suspects, missing cases and malformed case IDs', async () => {
    const invalidFormat = await requestCase(caseIds.public, '/accuse', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ suspectId: 'bad-id' }),
    });
    assert.equal(invalidFormat.status, 400);

    const unknownSuspect = await requestCase(caseIds.public, '/accuse', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ suspectId: 'suspect_99' }),
    });
    assert.equal(unknownSuspect.status, 400);
    assert.equal((await unknownSuspect.json()).error.code, 'INVALID_SUSPECT');
    assert.equal((await requestCase('bad-id')).status, 400);
    assert.equal((await requestCase('4'.repeat(24), '/result')).status, 404);
  });

  it('runs the full mocked case journey from creation through result and starts a second case', async () => {
    const created = await fetch(`${testBaseUrl}/api/cases`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ premise: 'A locked archive after a storm.', difficulty: 'easy' }),
    });
    const createdBody = await created.json();
    assert.equal(created.status, 201);
    assert.equal('culpritId' in createdBody.case, false);
    const createdId = createdBody.case.id;

    const retrieved = await requestCase(createdId);
    const retrievedBody = await retrieved.json();
    assert.equal(retrieved.status, 200);
    assert.equal(retrievedBody.case.status, 'active');
    assert.equal('finalSolution' in retrievedBody.case, false);

    const discovery = await requestCase(createdId, '/clues/clue_1/discover', { method: 'POST' });
    assert.equal(discovery.status, 200);
    assert.equal((await discovery.json()).discoveredClueCount, 1);
    const repeatedDiscovery = await requestCase(createdId, '/clues/clue_1/discover', { method: 'POST' });
    assert.equal((await repeatedDiscovery.json()).discoveredClueCount, 1);

    const firstHint = await requestCase(createdId, '/hints', { method: 'POST' });
    const secondHint = await requestCase(createdId, '/hints', { method: 'POST' });
    assert.equal((await firstHint.json()).hintsRemaining, 1);
    assert.equal((await secondHint.json()).hintsRemaining, 0);
    assert.equal((await requestCase(createdId, '/hints', { method: 'POST' })).status, 409);

    const accusation = await requestCase(createdId, '/accuse', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ suspectId: 'suspect_1' }),
    });
    const accusationBody = await accusation.json();
    assert.equal(accusation.status, 200);
    assert.equal(accusationBody.result.isCorrect, true);
    assert.equal(accusationBody.result.finalScore, 85);

    const result = await requestCase(createdId, '/result');
    const resultBody = await result.json();
    assert.equal(result.status, 200);
    assert.equal(resultBody.result.culprit, 'Suspect 1');
    assert.ok(resultBody.result.solutionExplanation);
    assert.ok(resultBody.result.clueConnections.length);

    const secondCase = await fetch(`${testBaseUrl}/api/cases`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ premise: 'A different case.', difficulty: 'medium' }),
    });
    const secondCaseBody = await secondCase.json();
    assert.equal(secondCase.status, 201);
    assert.notEqual(secondCaseBody.case.id, createdId);
  });
});
