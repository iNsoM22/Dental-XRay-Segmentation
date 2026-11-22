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

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function readSize(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const probe = new Image();
    probe.onload = () =>
      resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => reject(new Error("decode failed"));
    probe.src = url;
  });
}

export default function DentApp() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<PreviewMode>("original");
  const [findings, setFindings] = useState<FindingResult[]>([]);

  const urlRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const prevent = (event: DragEvent) => event.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
      clearTimer();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [clearTimer]);

  useEffect(() => {
    if (image) window.scrollTo({ top: 0, behavior: "auto" });
  }, [image]);

  const acceptFile = useCallback(
    async (file: File) => {
      clearTimer();
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
      } catch {
        URL.revokeObjectURL(url);
        setError("This image could not be opened. Please try another file.");
      }
    },
    [clearTimer],
  );

  const runPrediction = useCallback(() => {
    clearTimer();
    setPhase("running");
    timerRef.current = window.setTimeout(() => {
      setFindings([]);
      setPhase("done");
      setMode("segmentation");
      timerRef.current = null;
    }, 1200);
  }, [clearTimer]);

  const goHome = useCallback(() => {
    clearTimer();
    setPhase("idle");
    setMode("original");
    setFindings([]);
    setImage(null);
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [clearTimer]);

  return (
    <div className="app">
      <SiteHeader
        onHome={image ? goHome : undefined}
        onChangeImage={image ? acceptFile : undefined}
      />
      {image ? (
        <Workspace
          image={image}
          phase={phase}
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
