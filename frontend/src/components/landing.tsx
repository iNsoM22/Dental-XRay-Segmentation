"use client";

import { useRef, useState } from "react";
import {
  ReportIcon,
  ScanIcon,
  ShieldIcon,
  SparkleIcon,
  UploadIcon,
} from "./icons";

const FEATURES = [
  {
    icon: ScanIcon,
    title: "Image segmentation",
    body: "Highlight dental structures and findings directly on the scan.",
  },
  {
    icon: ReportIcon,
    title: "AI image summary",
    body: "Review detected findings and confidence scores at a glance.",
  },
  {
    icon: ShieldIcon,
    title: "Focused workflow",
    body: "Upload, segment, and inspect results in a single workspace.",
  },
];

export function Landing({
  onFile,
  error,
}: {
  onFile: (file: File) => void;
  error: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  return (
    <main className="landing shell">
      <section className="hero">
        <div className="eyebrow">
          <SparkleIcon size={14} />
          <span>AI-powered dental imaging</span>
        </div>

        <h1>
          Clarity for every <span className="accent">smile.</span>
        </h1>

        <p className="hero-lede">
          Bring your dental radiographs into focus. Upload an image to explore
          AI-assisted segmentation and a clear findings summary.
        </p>
      </section>

      <section className="upload-card" aria-label="Upload dental image">
        <div
          className="dropzone"
          data-dragging={dragging}
          tabIndex={0}
          role="button"
          aria-label="Upload a dental image. Click to browse or drag and drop a file here."
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("button")) return;
            openPicker();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) onFile(file);
          }}
        >
          <span className="drop-icon" aria-hidden="true">
            <UploadIcon size={28} />
          </span>

          <h2 className="drop-title">
            {dragging ? "Release to upload your image" : "Drop your dental image here"}
          </h2>

          <p className="drop-sub">
            {dragging
              ? "Your image will open in the Dent AI workspace."
              : "Drag and drop a radiograph into this area, or browse your device."}
          </p>

          <button
            className="btn btn-primary"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openPicker();
            }}
          >
            <UploadIcon size={16} />
            <span>Choose an image</span>
          </button>

          <p className="drop-help">
            Supported formats: <strong>PNG, JPG, JPEG, WEBP</strong> · Max size:{" "}
            <strong>20 MB</strong>
          </p>

          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
              event.target.value = "";
            }}
          />
        </div>

        {error && (
          <p className="upload-error" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </section>

      <section className="feature-row" aria-label="Capabilities">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div className="feature-item" key={feature.title}>
              <span className="feature-icon" aria-hidden="true">
                <Icon size={17} />
              </span>
              <div className="feature-copy">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
