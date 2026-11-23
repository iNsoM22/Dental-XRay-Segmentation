# Dental X-Ray Segmentation

Full-stack dental X-ray instance segmentation application powered by a YOLOv5 segmentation model, a FastAPI inference backend, and a Next.js frontend.

## Repository Structure

```text
.
├── backend/    # FastAPI inference API, YOLOv5 segmentation pipeline, SQLite cache
└── frontend/   # Next.js (App Router) UI and server-side API proxy routes
```

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## Architecture

1. **Frontend (Next.js on Vercel)**
   - Generates a per-tab `session_id` in `sessionStorage` and sends uploads/polls to Next.js Route Handlers (`/api/*`).
   - Server-side proxy routes attach `X-API-Key` (`BACKEND_API_KEY`) and forward `X-Session-ID` to the backend so the API key is never exposed to the browser.
2. **Backend (FastAPI on Hugging Face Spaces)**
   - Verifies `X-API-Key` on all `/api/*` endpoints using constant-time comparison.
   - Queues inference jobs in an in-memory `deque` + `asyncio.Condition` worker loop.
   - **Lazy model lifecycle**: loads the YOLOv5 model into memory on demand, processes queued requests, and unloads it after `MODEL_IDLE_TIMEOUT_SECONDS` of inactivity.
   - Persists prediction metadata and annotated PNG images in SQLite (`WAL` mode) with a 24-hour TTL.
   - Vendors a trimmed copy of `ultralytics/yolov5` in `backend/yolov5/` so no runtime repository download is required.

## Local Development

### 1. Start the Backend

```bash
cd backend
cp .env.example .env
# Set API_KEY in backend/.env
uv sync
uv run uvicorn app:app --host 127.0.0.1 --port 8000
```

### 2. Start the Frontend

```bash
cd frontend
cp .env.example .env.local
# Set BACKEND_URL=http://127.0.0.1:8000 and BACKEND_API_KEY=<same API_KEY>
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Docker Compose (Self-Hosted)

Run both services together with Docker Compose:

```bash
API_KEY=your-secret-api-key docker compose up --build -d
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- SQLite data is persisted in the `backend_data` Docker volume (`/app/data/predictions.db`).

## Deployment Overview

### Backend → Hugging Face Spaces (Docker)

- Deploy `backend/` to a **Docker** Space on Hugging Face.
- Expose port `7860` in the Space `Dockerfile` (`uvicorn app:app --host 0.0.0.0 --port 7860`).
- Add `API_KEY` as a Space **Secret**, and optionally configure `MODEL_IDLE_TIMEOUT_SECONDS` and `SQLITE_DB_PATH` as Space **Variables**.
- See [backend/README.md](./backend/README.md#deploying-to-hugging-face-spaces) for full details.

### Frontend → Vercel

- Import this repository into Vercel and set the **Root Directory** to `frontend`.
- Add `BACKEND_URL` (your Hugging Face Space direct URL, e.g. `https://<user>-<space>.hf.space`) and `BACKEND_API_KEY` (matching the Space `API_KEY` secret) in Vercel Environment Variables.
- See [frontend/README.md](./frontend/README.md#deploying-to-vercel) for full details.
