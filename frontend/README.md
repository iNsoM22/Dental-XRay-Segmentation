# Dental X-Ray Segmentation — Frontend

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 frontend for the Dental X-Ray Segmentation application.

## How It Connects to the Backend

Browser clients never call the FastAPI backend directly and never see `BACKEND_API_KEY`:

- The UI (`src/components/dent-app.tsx`) generates a per-tab `session_id` in `sessionStorage` and sends requests to Next.js Route Handlers under `src/app/api/`:
  - `POST /api/upload`
  - `GET /api/status/[fid]`
  - `GET /api/prediction-analysis/[fid]`
  - `GET /api/prediction-image/[fid]`
- Server-side proxy helpers (`src/lib/backend.ts`) inject `X-API-Key` (`BACKEND_API_KEY`) and forward `X-Session-ID` to `BACKEND_URL`.

## Local Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Configure `.env.local`:

```env
BACKEND_URL=http://127.0.0.1:8000
BACKEND_API_KEY=your-secret-api-key
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Description |
| --- | --- |
| `BACKEND_URL` | Base URL of the FastAPI backend (no trailing slash). |
| `BACKEND_API_KEY` | Shared API key sent to the backend as `X-API-Key` (must match backend `API_KEY`). |

## Scripts

- `npm run dev` — Start the Next.js development server.
- `npm run build` — Create a production build.
- `npm run start` — Serve the production build.
- `npm run lint` — Run ESLint.

## Deploying to Vercel

1. Import the repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Keep the default **Next.js** framework preset (`npm run build`).
4. Add **Environment Variables** in Project Settings:
   - `BACKEND_URL`: Your Hugging Face Space URL (e.g. `https://<username>-<space-name>.hf.space`).
   - `BACKEND_API_KEY`: The exact `API_KEY` secret configured in your Hugging Face Space.
5. Deploy (or redeploy after updating environment variables).
