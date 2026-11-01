# AI MYSTERY ROOM
## Project Specification (SPEC.md)

**Project Type:** AI-Powered Mystery Investigation Game  
**Development Approach:** Spec-Driven Development using Codex  
**Status:** Initial Specification  
**Primary Goal:** Build a complete, functional, responsive AI-powered mystery investigation web application.

---

# 1. Project Overview

AI Mystery Room is an interactive mystery investigation game in which users become detectives and solve AI-generated criminal mysteries.

Users can create a mystery by entering a story premise and selecting a difficulty level. The application uses Google's Gemini AI to generate a complete investigation scenario containing:

- A mystery story and crime description.
- A list of suspects.
- Individual suspect descriptions and statements.
- Evidence and clues.
- Investigation hints.
- A hidden culprit and solution.

Users investigate the case by discovering clues, examining evidence, requesting hints and analysing suspects.

At the end of the investigation, users accuse one suspect. The application checks their accusation against the actual culprit and displays the final verdict, explanation and score.

The experience should feel like an interactive detective investigation rather than a simple question-and-answer chatbot.

# 2. Project Objectives

The application must:

1. Generate unique mystery cases using Gemini AI.
2. Allow users to choose between Easy, Medium and Hard difficulty levels.
3. Provide suspects, clues and investigation details.
4. Allow users to discover clues progressively.
5. Allow users to request limited hints.
6. Allow users to submit their final accusation.
7. Calculate scores according to the defined scoring system.
8. Reveal the actual culprit and solution only after the final accusation.
9. Allow users to start a new mystery.
10. Provide a clean, responsive and engaging user interface.

# 3. Technology Stack

Use the following technologies.

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Google Gemini API using `@google/genai`
- Zod for input and generated-data validation
- dotenv for environment variables
- CORS

## Development Tools

- VS Code
- Codex for implementation
- Git and GitHub
- MongoDB Atlas
- Google AI Studio for Gemini API key

Do not replace the specified technology stack without a strong technical reason. Explain any necessary deviation before implementing it.

# 4. Application Architecture

Use a separate frontend and backend architecture.

```text
AI-MYSTERY-ROOM/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── SPEC.md
├── README.md
└── .gitignore
```

This is the proposed structure. Codex may add supporting files when necessary, but should maintain clear separation of frontend, backend, database and AI logic.

## Architecture responsibilities

**React frontend**
- Displays pages and investigation information.
- Manages user interactions.
- Sends requests to backend APIs.
- Displays clues, suspects, hints and results.
- Never contains Gemini API keys or the hidden solution.

**Express backend**
- Handles API requests.
- Validates incoming data.
- Communicates with Gemini.
- Manages mystery generation and investigation logic.
- Calculates scores.
- Controls when the solution can be revealed.

**MongoDB**
- Stores mystery cases and their investigation progress.
- Stores suspects, clues, hint usage and final results.

**Gemini AI**
- Generates mystery stories, suspects, clues, hints and solutions.
- Generates structured data according to the backend schema.

# 5. User Interface and Application Pages

The application should contain the following pages.

## 5.1 Home Page

Purpose: Introduce the game and encourage users to start an investigation.

Include:

- Application name: AI Mystery Room.
- Short introduction describing the detective experience.
- Attractive mystery/detective-themed hero section.
- Start Investigation button.
- Brief explanation of how the game works.
- Difficulty level information.

Clicking Start Investigation should navigate to the Create Mystery page.

## 5.2 Create Mystery Page

Purpose: Collect the information required to generate a mystery.

Include:

**Story Premise**
- A textarea where users describe the mystery they want to investigate.
- Example: "A famous businessman was found dead inside his locked study. Three people had reasons to hate him."

**Difficulty Selection**

Provide three options:

- Easy
- Medium
- Hard

**Generate Mystery button**

When clicked:

1. Validate the premise.
2. Send the premise and difficulty to the backend.
3. Backend requests a mystery from Gemini.
4. Validate the generated mystery.
5. Store the case in MongoDB.
6. Return the public case information.
7. Navigate to the Investigation Room.

Show a loading state while the mystery is being generated.

Do not allow empty premises.

## 5.3 Investigation Room

Purpose: Allow users to investigate the generated mystery.

This is the primary page of the application.

Display the following sections:

**A. Case Overview**
- Mystery title.
- Crime description.
- Story background.
- Difficulty level.
- Investigation status.

**B. Suspects**
Display each suspect in an individual card.

Each suspect should contain:
- Name.
- Age.
- Occupation.
- Description.
- Relationship with the victim.
- Possible motive.
- Alibi.
- Statement.

Suspect information must not directly reveal the culprit.

**C. Evidence and Clues**

Display available clues as individual evidence cards.

Each clue should contain:
- Clue title.
- Description.
- Evidence category where appropriate.
- Discovery status.

Users should click a clue to discover it.

Undiscovered clues should not reveal their actual content.

When discovered:
- Display the clue description.
- Mark the clue as discovered.
- Update the discovered-clue count.
- Update the investigation progress.

A discovered clue should not count again if the user clicks it repeatedly.

**D. Hint System**

Provide a Request Hint button.

When clicked:
- Send a request to the backend.
- Check whether the user has remaining hints.
- Return the next appropriate hint.
- Display the hint in the investigation room.
- Decrease the remaining hint count.

If no hints remain, display an appropriate message.

Hints should guide the user without directly revealing the culprit.

**E. Final Accusation**

Provide an Accuse Suspect button.

When clicked:
- Display the available suspects.
- Allow the user to select one suspect.
- Ask for confirmation before submitting the accusation.
- Submit the selected suspect to the backend.

Once submitted, the case should be marked completed.

Only one final accusation is allowed per case.

# 6. Difficulty Configuration

Difficulty determines the number of suspects, clues, hints and base score.

| Configuration | Easy | Medium | Hard |
|---|---:|---:|---:|
| Suspects | 3 | 4 | 5 |
| Clues | 5 | 7 | 9 |
| Available hints | 2 | 3 | 3 |
| Correct accusation base score | 100 | 150 | 200 |

The backend must enforce these values.

Gemini must generate the exact number of suspects and clues required by the selected difficulty.

# 7. Mystery Generation Using Gemini AI

Gemini is responsible for creating the mystery content.

The backend should send a structured prompt containing:

- User-provided premise.
- Selected difficulty.
- Required number of suspects.
- Required number of clues.
- Required number of hints.
- Instructions for generating a logically solvable mystery.

## Required mystery structure

Gemini should generate the following information:

### A. Case Information
- Case title.
- Crime description.
- Background story.
- Victim details.
- Location.
- Relevant timeline.

### B. Suspects
For each suspect:
- Unique ID.
- Name.
- Age.
- Occupation.
- Description.
- Relationship with victim.
- Motive.
- Alibi.
- Statement.

### C. Clues
For each clue:
- Unique ID.
- Title.
- Description.
- Evidence category.
- Relevance to the investigation.

Clues should provide meaningful information that helps identify the culprit.

### D. Hints
Generate the required number of progressively helpful hints.

Hints should encourage logical thinking without immediately revealing the answer.

### E. Hidden Solution

Generate:
- Culprit suspect ID.
- Explanation of why the suspect committed the crime.
- Detailed reasoning.
- Explanation of how the clues connect to the culprit.
- Final solution.

## AI generation requirements

1. Every mystery must have one clearly defined culprit.
2. The mystery must be logically solvable using the provided evidence.
3. Suspects must have believable motives and statements.
4. Clues must be relevant and consistent with the solution.
5. The generated story must not contradict itself.
6. The culprit must be included in the suspects list.
7. The same suspect must not have conflicting identities or information.
8. Generate structured JSON rather than unstructured conversational text.
9. Validate the generated response using Zod before saving.
10. Retry or return a useful error if the generated response is invalid.

Do not trust AI-generated data without backend validation.

# 8. Backend API Requirements

Implement the following REST API endpoints.

## 8.1 Generate Mystery

**Endpoint**

`POST /api/cases`

**Request body**

```json
{
  "premise": "A businessman was found dead in his locked study.",
  "difficulty": "easy"
}
```

**Responsibilities**
- Validate the premise.
- Validate difficulty.
- Generate the mystery using Gemini.
- Validate the generated JSON.
- Save the case in MongoDB.
- Return the public mystery information.

The response must not contain the culprit ID or hidden solution.

## 8.2 Retrieve Mystery

**Endpoint**

`GET /api/cases/:id`

**Responsibilities**
- Retrieve an existing case.
- Return the public case information.
- Return suspect details.
- Return clue discovery status.
- Return investigation progress.
- Return remaining hints.
- Do not reveal the solution for an active case.

## 8.3 Discover Clue

**Endpoint**

`POST /api/cases/:id/clues/:clueId/discover`

**Responsibilities**
- Check whether the case exists.
- Check whether the case is still active.
- Check whether the clue belongs to that case.
- Mark the clue as discovered.
- Return the clue information.
- Prevent duplicate discoveries.

## 8.4 Request Hint

**Endpoint**

`POST /api/cases/:id/hints`

**Responsibilities**
- Check whether the case exists.
- Check whether the case is active.
- Check whether hints remain.
- Return the next unused hint.
- Decrease the available hint count.
- Prevent users from requesting more hints than allowed.

## 8.5 Submit Accusation

**Endpoint**

`POST /api/cases/:id/accuse`

**Request body**

```json
{
  "suspectId": "suspect_1"
}
```

**Responsibilities**
- Validate the selected suspect.
- Check whether the case is active.
- Prevent repeated accusations.
- Compare the selected suspect with the hidden culprit.
- Calculate the final score on the backend.
- Mark the case as completed.
- Store the result.
- Return the verdict and solution.

The backend must never accept a score calculated by the frontend.

## 8.6 Retrieve Result

**Endpoint**

`GET /api/cases/:id/result`

**Responsibilities**
- Retrieve the completed case result.
- Return the verdict.
- Return the selected suspect.
- Return the actual culprit.
- Return the solution explanation.
- Return the final score.

Only completed cases should expose the solution.

# 9. Scoring System

The backend must calculate the score using the following formula.

**For a correct accusation:**

`Final Score = Base Score + (5 × Discovered Clues) - (10 × Hints Used)`

Minimum score is zero.

**For an incorrect accusation:**

Final score = 0.

### Example

An Easy mystery has:
- Base score = 100.
- Discovered clues = 4.
- Hints used = 1.

Calculation:

`100 + (4 × 5) - (1 × 10) = 110`

Final score = 110.

The backend must calculate and save the final score.

# 10. Database Design

Use MongoDB with Mongoose.

Create a Case model containing the following logical fields:

### Case Information
- `_id`
- `premise`
- `difficulty`
- `title`
- `crimeDescription`
- `backgroundStory`
- `victim`
- `location`
- `timeline`

### Investigation Information
- `suspects`
- `clues`
- `hints`
- `discoveredClueIds`
- `usedHintIds`
- `remainingHints`

### Hidden Solution
- `culpritId`
- `solutionExplanation`
- `reasoning`
- `clueConnections`

### Result Information
- `status` (active/completed)
- `accusedSuspectId`
- `isCorrect`
- `finalScore`
- `completedAt`

- `createdAt`
- `updatedAt`

Use appropriate nested schemas for suspects, clues and hints.

Keep hidden solution fields in the database but exclude them from all public API responses until the case is completed.

Do not expose internal Mongoose documents directly. Use explicit response objects or serializers to control which fields are returned.

# 11. Security and Validation

Security is an important project requirement.

Implement the following:

1. Store Gemini API keys only in backend environment variables.
2. Never expose secret keys in React code.
3. Never return the hidden culprit or solution while the case is active.
4. Validate all API inputs using Zod or equivalent validation.
5. Validate Gemini responses before database insertion.
6. Do not allow users to change their score through frontend requests.
7. Do not allow multiple accusations for the same case.
8. Do not allow clues to be discovered after case completion.
9. Do not allow hints after case completion.
10. Handle invalid case IDs and missing records.
11. Use appropriate HTTP status codes.
12. Keep `.env` out of Git using `.gitignore`.

For this initial version, user authentication is not required. Each mystery can be accessed using its unique case ID.

# 12. User Experience and Design Requirements

The application should have a polished detective-investigation theme.

## Visual Direction

Use a modern mystery/detective aesthetic.

Suggested design elements:
- Dark navy, charcoal and muted background colours.
- Gold or amber accents for important actions.
- Evidence-board inspired layouts.
- Clean typography.
- Subtle shadows and borders.
- Well-designed cards.
- Clear visual hierarchy.
- Smooth but restrained transitions.

Avoid excessive animations and unnecessary visual clutter.

## Responsive Design

The application must work on:
- Desktop.
- Laptop.
- Tablet.
- Mobile.

## Interaction Requirements

Provide:
- Loading indicators during AI generation.
- Error messages when API requests fail.
- Success messages when clues are discovered.
- Clear remaining-hint information.
- Investigation progress.
- Confirmation before final accusation.
- Clear final verdict and score.
- Navigation to start another mystery.

Do not use fake buttons or static features that appear interactive but do nothing.

# 13. Result Page

After the user submits an accusation, navigate to the Results page.

Display:

1. Case title.
2. Correct or incorrect verdict.
3. Suspect selected by the user.
4. Actual culprit.
5. Explanation of the crime.
6. How the clues connect to the culprit.
7. Number of clues discovered.
8. Number of hints used.
9. Final score.
10. Option to start another mystery.

Use clear visual differences between correct and incorrect accusations.

The result must be based on the backend response.

# 14. Error Handling

Handle the following situations:

- Empty mystery premise.
- Invalid difficulty.
- Gemini API failure.
- Gemini returning malformed JSON.
- Gemini returning an incorrect number of suspects or clues.
- MongoDB connection failure.
- Invalid case ID.
- Missing case.
- Invalid clue ID.
- Repeated clue discovery.
- Requesting hints after the limit.
- Accusation after case completion.
- Invalid suspect selection.
- Network errors.
- Unexpected server errors.

Display understandable messages to users instead of exposing technical stack traces.

Log useful technical errors on the backend.

# 15. Environment Variables

Backend `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

Frontend environment configuration:

```env
VITE_API_URL=http://localhost:5000
```

Never commit real credentials to GitHub.

Provide `.env.example` files containing placeholder values.

# 16. Project Development Strategy

Implement the project incrementally.

Do not attempt to generate the entire application in one uncontrolled step.

Follow this implementation order:

### Phase 1: Project Inspection and Setup
- Inspect the existing project folder.
- Check installed dependencies.
- Identify existing files.
- Set up frontend and backend architecture.
- Configure environment variables.
- Configure Tailwind CSS.
- Verify that both frontend and backend start successfully.

### Phase 2: Backend Foundation
- Configure Express.
- Configure CORS and JSON middleware.
- Connect MongoDB.
- Create the Case model.
- Create API routes and controllers.
- Implement error handling.

### Phase 3: Gemini Integration
- Configure Gemini SDK.
- Implement structured mystery generation.
- Add difficulty-based generation rules.
- Add Zod validation.
- Verify generated mysteries.

### Phase 4: Investigation APIs
- Implement case retrieval.
- Implement clue discovery.
- Implement hint requests.
- Implement accusation.
- Implement scoring.
- Implement result retrieval.
- Verify solution privacy.

### Phase 5: Frontend Implementation
- Create the Home page.
- Create the Create Mystery page.
- Create the Investigation Room.
- Create suspect and clue components.
- Implement hint interactions.
- Implement final accusation.
- Create the Results page.
- Add React Router and Axios integration.

### Phase 6: Integration and Testing
- Connect frontend to backend.
- Test all API interactions.
- Test all difficulty levels.
- Test scoring.
- Test error cases.
- Verify hidden solution security.
- Test responsive layouts.

### Phase 7: Finalization
- Improve UI and user experience.
- Remove unused code.
- Fix console errors.
- Prepare README.
- Prepare GitHub repository.
- Prepare deployment configuration.

Do not skip testing between phases.

# 17. Acceptance Criteria

The project is considered complete only when all the following requirements work.

## Mystery Generation
- [ ] User can enter a premise.
- [ ] User can select Easy, Medium or Hard.
- [ ] Gemini generates a mystery.
- [ ] Easy generates exactly 3 suspects and 5 clues.
- [ ] Medium generates exactly 4 suspects and 7 clues.
- [ ] Hard generates exactly 5 suspects and 9 clues.
- [ ] Generated mystery is saved in MongoDB.

## Investigation
- [ ] User can view all suspects.
- [ ] User can discover clues.
- [ ] Discovered clues are displayed correctly.
- [ ] Duplicate clue discoveries do not increase the count.
- [ ] User can request hints.
- [ ] Hint limits are enforced.

## Accusation and Results
- [ ] User can select a suspect.
- [ ] Only one final accusation is allowed.
- [ ] Correct accusation is identified correctly.
- [ ] Incorrect accusation is identified correctly.
- [ ] Score is calculated correctly.
- [ ] Actual culprit is revealed only after accusation.
- [ ] Solution explanation is displayed.
- [ ] User can start a new mystery.

## Security
- [ ] Gemini key is never exposed to frontend.
- [ ] Hidden solution is never returned for an active case.
- [ ] Frontend cannot manipulate the score.
- [ ] Backend validates all important operations.

## User Experience
- [ ] All pages are navigable.
- [ ] Loading and error states work.
- [ ] Buttons and interactions work.
- [ ] Layout is responsive.
- [ ] No major console errors.

## Deployment
- [ ] Frontend is deployed.
- [ ] Backend is deployed.
- [ ] MongoDB Atlas connection works.
- [ ] Gemini API works in production.
- [ ] Live application can generate and complete a mystery.

# 18. Deployment Requirements

Prepare the application for deployment.

Suggested services:

- Frontend: Vercel.
- Backend: Render.
- Database: MongoDB Atlas.
- AI: Google Gemini API.

Configure production environment variables securely.

Ensure that:
- Frontend points to the deployed backend.
- Backend accepts requests from the deployed frontend.
- MongoDB Atlas accepts the backend connection.
- Gemini works using the production API key.
- No local-only URLs remain in production configuration.

# 19. Out of Scope for Initial Version

To keep the project achievable and focused on the college requirements, do not implement the following in the initial version:

- User authentication and registration.
- Payment systems.
- Multiplayer investigations.
- Real WhatsApp integration.
- Real CCTV integration.
- Actual video surveillance.
- AI-generated image or video evidence.
- Voice interaction.
- Advanced analytics dashboard.
- Admin dashboard.

Evidence can be presented through visually designed cards, statements and text-based documents.

Do not spend time building advanced features before the required investigation workflow is complete.

# 20. Instructions for Codex

Treat this `SPEC.md` as the Single Source of Truth for the project.

Follow these rules throughout development:

1. Read this entire specification before making changes.
2. Inspect the existing repository before creating or modifying files.
3. Do not unnecessarily recreate an already working project.
4. Do not overwrite useful existing work without checking it.
5. Follow the specified technology stack.
6. Build the application incrementally according to the development phases.
7. Before implementing a phase, explain briefly what you intend to change.
8. Implement the actual functionality, not just UI placeholders.
9. Keep code modular, readable and maintainable.
10. Use beginner-friendly project structure and avoid unnecessary complexity.
11. Do not hardcode generated mysteries or fake API responses as the final implementation.
12. Do not expose the Gemini API key or hidden solution.
13. Add appropriate validation and error handling.
14. Run relevant tests and build checks after implementation.
15. Fix errors before marking a phase complete.
16. Update README with setup instructions and environment variables.
17. Maintain this specification as the project's reference. If a requirement needs to change, explain the reason and update the specification deliberately.
18. Do not silently remove or weaken acceptance criteria.

## Important Working Rule

Work in small, verifiable phases.

After completing each phase:

- Summarize the files created or modified.
- Explain what was implemented.
- Report tests and build results.
- Identify anything still incomplete.
- Wait for approval before proceeding to the next major phase.

Do not claim that a feature works unless it has actually been implemented and tested.

---

**Final Goal:** Deliver a fully functional, responsive AI Mystery Room application that satisfies the college project requirements, uses Gemini for mystery generation, stores cases in MongoDB, supports complete detective investigations, calculates scores correctly and can be deployed as a live web application.