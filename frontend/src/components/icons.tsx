type IconProps = { size?: number; className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.65,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function UploadIcon({ size = 24, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...base}>
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
  );
}

export function SparkleIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} {...base}>
      <path d="m10 2.2 1.7 4.8 4.8 1.7-4.8 1.7-1.7 4.8-1.7-4.8-4.8-1.7 4.8-1.7L10 2.2Z" />
      <path d="m15.8 13.4.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ScanIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...base}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <path d="M7.5 12h9" />
    </svg>
  );
}

export function ReportIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...base}>
      <path d="M4.5 5.5h15v10.5H10l-5.5 3.5V5.5Z" />
      <path d="M8 9.5h8M8 13h5" />
    </svg>
  );
}

export function ShieldIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...base}>
      <path d="M12 3.5 5.5 6v5c0 4.2 2.8 7.6 6.5 9.5 3.7-1.9 6.5-5.3 6.5-9.5V6L12 3.5Z" />
      <path d="m9.2 11.6 2 2 3.6-3.8" />
    </svg>
  );
}

export function BackIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...base}>
      <path d="M14.5 5.5 8 12l6.5 6.5M8.4 12H20" />
    </svg>
  );
}

export function ImageIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} {...base}>
      <rect x="3" y="3" width="14" height="14" rx="2.5" />
      <circle cx="7.2" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="m4.5 14 3.4-3.4 2.3 2 2.2-2.1 3.1 3.5" />
    </svg>
  );
}

export function PlusIcon({ size = 15, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} {...base}>
      <path d="M10 3.5v13M3.5 10h13" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} {...base}>
      <circle cx="10" cy="10" r="7.2" />
      <path d="m6.8 10.1 2.1 2.1 4.4-4.5" />
    </svg>
  );
}

export function InfoIcon({ size = 15, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} {...base}>
      <circle cx="10" cy="10" r="7.2" />
      <path d="M10 9v4m0-6.2v.1" />
    </svg>
  );
}
