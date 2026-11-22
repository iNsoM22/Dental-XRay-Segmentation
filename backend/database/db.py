from pathlib import Path
from dotenv import load_dotenv
import json
import os
import sqlite3
import threading
from datetime import datetime, timezone
from typing import Optional

# Load environment variables
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

DEFAULT_DB_PATH = BACKEND_DIR / "data" / "predictions.db"
TTL_SECONDS = 60 * 60 * 24


class SqlitePredictionStore:
    """Thread-safe SQLite store for cached prediction images and analysis."""

    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._initialize()

    def _initialize(self):
        with self._lock:
            self._conn.execute("PRAGMA journal_mode=WAL;")
            self._conn.execute("PRAGMA synchronous=NORMAL;")
            self._conn.execute("PRAGMA busy_timeout=5000;")
            self._conn.execute(
                """
                CREATE TABLE IF NOT EXISTS predictions (
                    fid TEXT PRIMARY KEY,
                    session_id TEXT,
                    image BLOB NOT NULL,
                    analysis TEXT NOT NULL,
                    created_at REAL NOT NULL
                );
                """
            )
            self._conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions (created_at);"
            )
            self._conn.commit()

    def insert_many(self, entries: list[dict]):
        if not entries:
            return
        rows = []
        for item in entries:
            created = item.get("createdAt")
            created_ts = (
                created.timestamp()
                if isinstance(created, datetime)
                else datetime.now(timezone.utc).timestamp()
            )
            rows.append(
                (
                    item["fid"],
                    item.get("sessionId"),
                    bytes(item["image"]),
                    json.dumps(item["analysis"]),
                    created_ts,
                )
            )
        with self._lock:
            self._conn.executemany(
                """
                INSERT OR REPLACE INTO predictions (fid, session_id, image, analysis, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                rows,
            )
            self._conn.commit()

    def find_one(self, fid: str, include_payload: bool = True) -> Optional[dict]:
        cols = "fid, session_id, image, analysis, created_at" if include_payload else "fid, session_id, created_at"
        cutoff = datetime.now(timezone.utc).timestamp() - TTL_SECONDS
        with self._lock:
            row = self._conn.execute(
                f"SELECT {cols} FROM predictions WHERE fid = ? AND created_at >= ?",
                (fid, cutoff),
            ).fetchone()
        if row is None:
            return None
        result = {
            "fid": row["fid"],
            "sessionId": row["session_id"],
        }
        if include_payload:
            result["image"] = row["image"]
            result["analysis"] = json.loads(row["analysis"])
        return result

    def delete_expired(self, ttl_seconds: int = TTL_SECONDS) -> int:
        cutoff = datetime.now(timezone.utc).timestamp() - ttl_seconds
        with self._lock:
            cur = self._conn.execute(
                "DELETE FROM predictions WHERE created_at < ?",
                (cutoff,),
            )
            self._conn.commit()
            return cur.rowcount

    def close(self):
        with self._lock:
            self._conn.close()


def init_sqlite_db() -> SqlitePredictionStore:
    raw_path = os.getenv("SQLITE_DB_PATH", "").strip()
    db_path = Path(raw_path) if raw_path else DEFAULT_DB_PATH
    if not db_path.is_absolute():
        db_path = BACKEND_DIR / db_path
    return SqlitePredictionStore(db_path)
