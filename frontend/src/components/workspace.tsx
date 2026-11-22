"use client";

import { BrandMark } from "./brand";
import {
  CheckCircleIcon,
  InfoIcon,
  ReportIcon,
  ShieldIcon,
  SparkleIcon,
} from "./icons";
import type {
  FindingResult,
  Phase,
  PreviewMode,
  UploadedImage,
} from "./dent-app";

export function Workspace({
  image,
  segmentedUrl,
  phase,
  queueStatus,
  error,
  mode,
  findings,
  onMode,
  onPredict,
}: {
  image: UploadedImage;
  segmentedUrl: string | null;
  phase: Phase;
  queueStatus: string;
  error: string;
  mode: PreviewMode;
  findings: FindingResult[];
  onMode: (mode: PreviewMode) => void;
  onPredict: () => void;
}) {
  const showSegmented = phase === "done" && mode === "segmentation";
  const displaySrc = showSegmented && segmentedUrl ? segmentedUrl : image.url;

  return (
    <main className="workspace shell">
      <div className="workspace-grid">
        <section className="panel image-panel" aria-label="Image preview">
          <div className="panel-heading">
            <div>
              <h2>Image preview</h2>
              <p>Switch between your uploaded image and the segmentation output.</p>
            </div>
            <span className="status-badge" data-state={phase}>
              <span className="status-dot" aria-hidden="true" />
              {phase === "running"
                ? "Processing"
                : showSegmented
                  ? "Segmentation"
                  : "Original image"}
            </span>
          </div>

          <div className="tabs-row" role="tablist" aria-label="Image view">
            <button
              className="tab-btn"
              type="button"
              role="tab"
              id="tab-original"
              aria-controls="preview-stage"
              aria-selected={mode === "original"}
              onClick={() => onMode("original")}
            >
              Original image
            </button>
            <button
              className="tab-btn"
              type="button"
              role="tab"
              id="tab-segmentation"
              aria-controls="preview-stage"
              aria-selected={mode === "segmentation"}
              disabled={phase !== "done"}
              onClick={() => onMode("segmentation")}
            >
              Predicted segmentation
            </button>
          </div>

          <div className="image-stage-wrap">
            <div
              className="image-stage"
              id="preview-stage"
              role="tabpanel"
              aria-labelledby={
                mode === "segmentation" ? "tab-segmentation" : "tab-original"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="stage-image"
                src={displaySrc}
                alt={
                  showSegmented
                    ? "Predicted dental radiograph segmentation"
                    : "Uploaded dental radiograph"
                }
              />
            </div>

            {phase === "running" && (
              <div className="stage-scanning" aria-live="polite">
                <div className="scan-line" aria-hidden="true" />
                <span className="scan-pill">
                  <span className="spinner spinner-dark" aria-hidden="true" />
                  {queueStatus}
                </span>
              </div>
            )}

            <div className="stage-chip">
              <ShieldIcon size={13} />
              <span>{showSegmented ? "Segmentation view" : "Original upload"}</span>
            </div>
          </div>

          {error && phase !== "running" && (
            <p className="upload-error" role="alert">
              {error}
            </p>
          )}

          <div className="image-footer">
            <div className="image-hint">
              <InfoIcon size={15} />
              <span>
                {showSegmented
                  ? "Showing segmentation view."
                  : "Your original image is preserved."}
              </span>
            </div>
            <button
              className="btn btn-primary btn-predict"
              type="button"
              onClick={onPredict}
              disabled={phase === "running"}
            >
              {phase === "running" ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Processing image…</span>
                </>
              ) : (
                <>
                  <SparkleIcon size={16} />
                  <span>
                    {phase === "done" ? "Run again" : "Predict segmentation"}
                  </span>
                </>
              )}
            </button>
          </div>
        </section>

        <aside className="panel summary-panel" aria-label="AI image summary">
          <div className="summary-head">
            <div className="summary-title-wrap">
              <span className="summary-icon" aria-hidden="true">
                <ReportIcon size={18} />
              </span>
              <div>
                <h2>AI image summary</h2>
                <p>Findings at a glance</p>
              </div>
            </div>
            <span className="readonly-tag">READ ONLY</span>
          </div>

          <div className="summary-body">
            {phase !== "done" ? (
              <div className="summary-placeholder">
                <div className="summary-orbit" aria-hidden="true">
                  <BrandMark size={28} />
                </div>
                <h3>Your summary will appear here</h3>
                <p>
                  Run segmentation to analyze this radiograph and list any
                  detected findings.
                </p>
              </div>
            ) : findings.length > 0 ? (
              <div className="summary-content">
                <div className="summary-section">
                  <h3>Findings ({findings.length})</h3>
                  <ul className="findings-list">
                    {findings.map((item) => (
                      <li className="finding-row" key={item.name}>
                        <div className="finding-meta">
                          <span
                            className="finding-swatch"
                            style={{ backgroundColor: item.color }}
                            aria-hidden="true"
                          />
                          <span className="finding-name">{item.name}</span>
                        </div>
                        <div className="finding-stats tnum">
                          <span className="finding-count">{item.count}×</span>
                          <span className="finding-conf">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="summary-content">
                <div className="summary-empty-findings">
                  <span className="summary-empty-icon" aria-hidden="true">
                    <CheckCircleIcon size={20} />
                  </span>
                  <h3>No findings detected</h3>
                  <p>
                    Segmentation is complete. No dental findings were detected in
                    this radiograph.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
