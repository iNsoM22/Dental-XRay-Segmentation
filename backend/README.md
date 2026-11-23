# Dental X-Ray Segmentation — Backend

FastAPI inference service for dental X-ray instance segmentation using a custom YOLOv5 model (`model/model.pt`) and a vendored, trimmed `yolov5/` runtime.

## Features

- **API Key Authentication**: All endpoints require `X-API-Key` matching `API_KEY` (constant-time check).
- **Session & Queue Tracking**: Accepts `X-Session-ID` (`session_id`) and tracks queued/processing/completed jobs via `/api/status/{fid}`.
- **Manual Request Queue**: Uses an in-memory `collections.deque` + `asyncio.Condition` worker loop to serialize inference without blocking the event loop.
- **Lazy Model Lifecycle (`ModelManager`)**: Loads the YOLOv5 model on demand when a request arrives, keeps it in RAM while draining the queue, and unloads it after `MODEL_IDLE_TIMEOUT_SECONDS` of inactivity.
- **SQLite Persistence**: Stores prediction analysis JSON and rendered PNG bytes in SQLite (`WAL` mode) with batched writes and automatic 24-hour TTL cleanup.
- **Vendored YOLOv5**: Required `yolov5` modules (`models/`, `utils/`, `export.py`) are committed under `backend/yolov5/`, avoiding runtime downloads.

## Requirements

- Python `3.11+`
- [`uv`](https://docs.astral.sh/uv/) (recommended) or `pip`
- Model weights at `backend/model/model.pt`

## Local Setup

```bash
cd backend
cp .env.example .env
uv sync
```

Edit `.env` and set a strong `API_KEY`:

```env
API_KEY=your-secret-api-key
MODEL_IDLE_TIMEOUT_SECONDS=120
SQLITE_DB_PATH=data/predictions.db
```

Run the development server:

```bash
uv run uvicorn app:app --host 127.0.0.1 --port 8000
```

(Or `uv run python app.py`, which starts Uvicorn on `127.0.0.1:8000`.)

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `API_KEY` | *(required)* | Shared secret expected in the `X-API-Key` request header. |
| `MODEL_IDLE_TIMEOUT_SECONDS` | `120` | Seconds of inactivity before unloading the YOLOv5 model from RAM. |
| `SQLITE_DB_PATH` | `data/predictions.db` | Path to the SQLite database file (relative to `backend/` or absolute). |

## API Endpoints

All endpoints require the `X-API-Key` header.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/upload` | Upload an X-ray image (`file` multipart field, optional `X-Session-ID` header or `session_id` form field). Returns `202` with `fid`, `session_id`, and `status_url`. |
| `GET` | `/api/status/{fid}` | Returns job state (`queued`, `processing`, `completed`, or `failed`), `queue_position`, `queue_length`, and `model_loaded`. |
| `GET` | `/api/prediction-analysis/{fid}` | Returns parsed segmentation findings and confidence summary (`202` while still queued/processing). |
| `GET` | `/api/prediction-image/{fid}` | Returns the annotated segmentation PNG image (`202` while still queued/processing). |

## Deploying to Hugging Face Spaces

Hugging Face **Docker Spaces** run containers listening on port `7860`:

1. Create a new Space on Hugging Face with SDK set to **Docker**.
2. Push the `backend/` contents (including `model/model.pt` via Git LFS if over 10 MB, and `yolov5/`) with a `Dockerfile` that installs dependencies and starts Uvicorn on port `7860`:
   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app
   RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

   COPY pyproject.toml uv.lock ./
   RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev

   COPY . .
   EXPOSE 7860
   CMD ["uv", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
   ```
3. In the Space **Settings → Variables and secrets**:
   - Add **Secret**: `API_KEY` (use the same value for `BACKEND_API_KEY` on Vercel).
   - Add **Variables** (optional): `MODEL_IDLE_TIMEOUT_SECONDS=120`, `SQLITE_DB_PATH=/tmp/predictions.db` (or `data/predictions.db` if writable).
4. Note on SQLite in Spaces: SQLite runs in-process with zero external database setup. Container storage is ephemeral across Space rebuilds/restarts, which fits the 24-hour prediction cache.
