export function getBackendConfig() {
  const url = (process.env.BACKEND_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
  const apiKey = (process.env.BACKEND_API_KEY || "").trim();
  return { url, apiKey };
}

export function buildBackendHeaders(req: Request): Headers {
  const { apiKey } = getBackendConfig();
  const headers = new Headers();

  if (apiKey) {
    headers.set("X-API-Key", apiKey);
  }

  const sessionId = req.headers.get("x-session-id");
  if (sessionId) {
    headers.set("X-Session-ID", sessionId);
  }

  return headers;
}
