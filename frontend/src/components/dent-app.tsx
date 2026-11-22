"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Landing } from "./landing";
import { SiteHeader } from "./site-header";
import { Workspace } from "./workspace";

export type Phase = "idle" | "running" | "done";
export type PreviewMode = "original" | "segmentation";

export type UploadedImage = {
  file: File;
  url: string;
  width: number;
  height: number;
};

export type FindingResult = {
  name: string;
  count: number;
  confidence: number;
  color: string;
};

type BackendAnalysisItem = {
  className: string;
  count: number;
  averageConfidence: number;
};

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const POLL_INTERVAL_MS = 800;
const SESSION_STORAGE_KEY = "dentai_session_id";

const PALETTE = [
  "#2563eb",
  "#0891b2",
  "#7c3aed",
  "#d97706",
  "#dc2626",
  "#059669",
  "#db2777",
  "#4f46e5",
];

function colorForClass(name: string, index: number) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[(hash + index) % PALETTE.length];
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const created = window.crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

function readSize(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const probe = new Image();
    probe.onload = () =>
      resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => reject(new Error("decode failed"));
    probe.src = url;
  });
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export default function DentApp() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [segmentedUrl, setSegmentedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [queueStatus, setQueueStatus] = useState("Analyzing radiograph…");
  const [mode, setMode] = useState<PreviewMode>("original");
  const [findings, setFindings] = useState<FindingResult[]>([]);

  const urlRef = useRef<string | null>(null);
  const segmentedUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>("");

  const cancelInFlight = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const clearSegmentedUrl = useCallback(() => {
    if (segmentedUrlRef.current) {
      URL.revokeObjectURL(segmentedUrlRef.current);
      segmentedUrlRef.current = null;
    }
    setSegmentedUrl(null);
  }, []);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
    const prevent = (event: DragEvent) => event.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
      cancelInFlight();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      if (segmentedUrlRef.current) URL.revokeObjectURL(segmentedUrlRef.current);
    };
  }, [cancelInFlight]);

  useEffect(() => {
    if (image) window.scrollTo({ top: 0, behavior: "auto" });
  }, [image]);

  const acceptFile = useCallback(
    async (file: File) => {
      cancelInFlight();
      clearSegmentedUrl();
      setError("");

      if (!ALLOWED.includes(file.type)) {
        setError("Please choose a PNG, JPG, JPEG, or WEBP image.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("This file is larger than 20 MB. Please choose a smaller image.");
        return;
      }

      const url = URL.createObjectURL(file);
      try {
        const size = await readSize(url);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setImage({ file, url, ...size });
        setPhase("idle");
        setMode("original");
        setFindings([]);
        setQueueStatus("Analyzing radiograph…");
      } catch {
        URL.revokeObjectURL(url);
        setError("This image could not be opened. Please try another file.");
      }
    },
    [cancelInFlight, clearSegmentedUrl],
  );

  const runPrediction = useCallback(async () => {
    if (!image) return;
    cancelInFlight();
    clearSegmentedUrl();
    setError("");
    setPhase("running");
    setMode("original");
    setQueueStatus("Uploading radiograph…");

    const controller = new AbortController();
    abortRef.current = controller;
    const sessionId = sessionIdRef.current || getOrCreateSessionId();
    sessionIdRef.current = sessionId;

    try {
      const formData = new FormData();
      formData.append("file", image.file);
      formData.append("session_id", sessionId);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "X-Session-ID": sessionId,
        },
        body: formData,
        signal: controller.signal,
      });

      const uploadJson = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadJson?.data?.fid) {
        throw new Error(
          uploadJson?.detail || "Upload failed. Please check the backend connection.",
        );
      }

      const fid: string = uploadJson.data.fid;
      const initialPos: number = uploadJson.data.queue_position ?? 1;
      setQueueStatus(
        initialPos > 1
          ? `Queued (position ${initialPos})…`
          : "Queued for segmentation…",
      );

      while (true) {
        await sleep(POLL_INTERVAL_MS, controller.signal);

        const statusRes = await fetch(`/api/status/${encodeURIComponent(fid)}`, {
          headers: { "X-Session-ID": sessionId },
          signal: controller.signal,
        });
        const statusJson = await statusRes.json().catch(() => null);

        if (!statusRes.ok) {
          throw new Error(statusJson?.detail || "Failed to check queue status.");
        }

        if (statusJson.status === "failed") {
          throw new Error(statusJson.error || "Segmentation failed on the server.");
        }

        if (statusJson.status === "completed") {
          setQueueStatus("Loading segmentation results…");
          break;
        }

        if (statusJson.status === "processing") {
          setQueueStatus(
            statusJson.model_loaded
              ? "Analyzing radiograph…"
              : "Loading model & analyzing…",
          );
        } else if (statusJson.status === "queued") {
          const pos = statusJson.queue_position;
          setQueueStatus(
            pos > 1 ? `Queued (position ${pos})…` : "Queued for segmentation…",
          );
        }
      }

      const [analysisRes, imageRes] = await Promise.all([
        fetch(`/api/prediction-analysis/${encodeURIComponent(fid)}`, {
          headers: { "X-Session-ID": sessionId },
          signal: controller.signal,
        }),
        fetch(`/api/prediction-image/${encodeURIComponent(fid)}`, {
          headers: { "X-Session-ID": sessionId },
          signal: controller.signal,
        }),
      ]);

      if (!analysisRes.ok) {
        const errJson = await analysisRes.json().catch(() => null);
        throw new Error(errJson?.detail || "Failed to retrieve prediction analysis.");
      }

      if (!imageRes.ok) {
        const errJson = await imageRes.json().catch(() => null);
        throw new Error(errJson?.detail || "Failed to retrieve segmented image.");
      }

      const analysisData: BackendAnalysisItem[] = await analysisRes.json();
      const imageBlob = await imageRes.blob();
      const resultUrl = URL.createObjectURL(imageBlob);

      if (segmentedUrlRef.current) {
        URL.revokeObjectURL(segmentedUrlRef.current);
      }
      segmentedUrlRef.current = resultUrl;
      setSegmentedUrl(resultUrl);

      const mappedFindings: FindingResult[] = Array.isArray(analysisData)
        ? analysisData.map((item, idx) => ({
            name: item.className,
            count: item.count,
            confidence: item.averageConfidence,
            color: colorForClass(item.className, idx),
          }))
        : [];

      setFindings(mappedFindings);
      setPhase("done");
      setMode("segmentation");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Prediction failed.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [image, cancelInFlight, clearSegmentedUrl]);

  const goHome = useCallback(() => {
    cancelInFlight();
    clearSegmentedUrl();
    setError("");
    setPhase("idle");
    setMode("original");
    setFindings([]);
    setImage(null);
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [cancelInFlight, clearSegmentedUrl]);

  return (
    <div className="app">
      <SiteHeader
        onHome={image ? goHome : undefined}
        onChangeImage={image ? acceptFile : undefined}
      />
      {image ? (
        <Workspace
          image={image}
          segmentedUrl={segmentedUrl}
          phase={phase}
          queueStatus={queueStatus}
          error={error}
          mode={mode}
          findings={findings}
          onMode={setMode}
          onPredict={runPrediction}
        />
      ) : (
        <Landing onFile={acceptFile} error={error} />
      )}
    </div>
  );
}
