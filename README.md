# AI Mystery Room

AI Mystery Room is a browser-based detective game. A player provides a premise and difficulty, investigates an AI-generated case by discovering clues and requesting limited hints, then accuses a suspect to receive a backend-scored verdict and explanation.

## Features

- Five-page flow: Home, Create Mystery, Investigation Room, Accusation, and Results.
- Gemini-generated cases with difficulty-specific suspect, clue, and hint counts.
- MongoDB persistence for cases and investigation progress.
- Server-side validation, scoring, and progressive hint limits.
- Hidden culprit and solution fields excluded from public case responses until an accusation completes the case.
- Responsive detective-themed interface with loading, error, empty, and success states.

## Technology stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS.
- Backend: Node.js, Express, Mongoose, Zod, `@google/genai`.
- Database: MongoDB (MongoDB Atlas for deployment).
- Tests: Node's built-in test runner and HTTP tests against the backend app.

## Project structure

```text
client/
  src/components/       Shared layout and case/UI components
  src/pages/            Five game pages and not-found page
  src/services/api.js   Axios API client
  vercel.json           SPA route rewrite for Vercel
server/
  config/               MongoDB connection
  controllers/          Case and investigation behavior
  middleware/           Request validation and centralized errors
  models/               Mongoose Case model
  routes/               Express API routes
  services/             Gemini generation and response schemas
  tests/                Backend API and integration tests
  utils/                Serialization, difficulty, and scoring helpers
Spec.md                 Project requirements and source of truth
```

## Prerequisites

- Node.js 20.19+ or 22.12+ and npm.
- A MongoDB database (local or MongoDB Atlas) for database-backed operations.
- A Google Gemini API key for real case generation.

## Local installation and configuration

Install dependencies in each application directory:

```sh
cd server
npm ci
cd ../client
npm ci
```

Create local environment files from the templates (PowerShell):

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env.local
```

Configure these variables without committing the local files:

| Variable | Configure in | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `server/.env` | MongoDB connection string |
| `GEMINI_API_KEY` | `server/.env` | Private backend Gemini credential |
| `GEMINI_MODEL` | `server/.env` (optional) | Gemini model ID; defaults to `gemini-3.8-flash` |
| `PORT` | `server/.env` (optional) | Backend port; defaults to `5000`, Render provides this in production |
| `CLIENT_URL` | `server/.env` | Exact frontend origin allowed by backend CORS |
| `VITE_API_URL` | `client/.env.local` | Backend origin or API base URL; local default is `http://127.0.0.1:5000` |

The `.gitignore` excludes `.env` files while allowing `.env.example` templates. Never put the Gemini key in a `VITE_` variable; Vite variables are included in browser code.

## Run locally

Start the backend in one terminal:

```sh
cd server
npm run dev
```

Start the frontend in another terminal:

```sh
cd client
npm run dev
```

Open `http://127.0.0.1:5173`. The API health endpoint is `http://127.0.0.1:5000/api/health`. It reports a degraded status with HTTP 503 until MongoDB connects. Case creation also needs a valid Gemini API key.

## API summary

All routes use the `/api` prefix and JSON request/response bodies.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service and database status |
| `POST` | `/api/cases` | Generate and save a case from `{ premise, difficulty }` |
| `GET` | `/api/cases/:id` | Retrieve public case information and investigation progress |
| `POST` | `/api/cases/:id/clues/:clueId/discover` | Discover one clue |
| `POST` | `/api/cases/:id/hints` | Request the next available hint |
| `POST` | `/api/cases/:id/accuse` | Submit one suspect accusation and receive the server-calculated result |
| `GET` | `/api/cases/:id/result` | Retrieve the completed verdict and solution |

The culprit and solution are omitted from public case responses. The result route only returns the solution after the case is completed by an accusation.

## Tests and production build

Run the complete backend suite and frontend production build:

```sh
cd server
npm test
cd ../client
npm run build
```

The backend test suite uses test doubles for MongoDB and Gemini where appropriate; it does not prove credentials or live third-party services work. A real end-to-end session requires valid `MONGODB_URI` and `GEMINI_API_KEY` values.

## Deployment

Deployment is prepared for Vercel, Render, and MongoDB Atlas; this repository does not deploy automatically.

### MongoDB Atlas

1. Create an Atlas cluster and a database user with access to the application database.
2. Configure Atlas network access to permit connections from the Render backend. Restrict access according to your deployment's network requirements.
3. Copy the Atlas connection string into Render's `MONGODB_URI` environment variable. Do not commit it or put it in frontend configuration.

### Backend on Render

1. Create a Render Web Service connected to the repository and set its root directory to `server`.
2. Use the Node runtime, build command `npm ci`, and start command `npm start`.
3. Set `MONGODB_URI`, `GEMINI_API_KEY`, and `CLIENT_URL` in the Render dashboard. Set `GEMINI_MODEL` only if overriding the supported default. Render supplies `PORT`; the server binds to `0.0.0.0`.
4. Set `CLIENT_URL` to the exact deployed Vercel origin (for example, `https://your-project.vercel.app`). Update it if the frontend origin changes.
5. After deployment, check `https://<render-service-host>/api/health`; it should report the database connected.

### Frontend on Vercel

1. Import the repository as a Vercel project and set the root directory to `client`.
2. Use the Vite framework preset, build command `npm run build`, and output directory `dist`.
3. Set `VITE_API_URL` to the Render service origin, such as `https://<render-service-host>` (the client adds `/api`). Do not add credentials to this variable.
4. The included `client/vercel.json` rewrites client-side routes to `index.html`. Redeploy after changing environment variables.
5. Confirm the deployed UI can reach the Render health endpoint and exercise the complete game flow with valid services configured.

Configure production secrets only in the respective provider dashboards. Vercel deployment requires access to the user's Vercel account; Render deployment requires access to the user's Render account; Atlas setup requires the user's MongoDB Atlas account. No deployment or external account changes are performed by these instructions.
