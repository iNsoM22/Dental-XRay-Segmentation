export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9.1 5.1c-2.6 0-4.3 2.2-4.3 5.6 0 3.8 1.9 9.2 3.3 12.2.7 1.5 1.4 2.2 2.2 2.2 1.2 0 1.5-1.2 2-3.5.4-1.9 1-3.4 2.1-3.4s1.7 1.5 2.1 3.4c.5 2.3.8 3.5 2 3.5.8 0 1.5-.7 2.2-2.2 1.4-3 3.3-8.4 3.3-12.2 0-3.4-1.7-5.6-4.3-5.6-1.8 0-3.4 1-5.3 1s-3.5-1-5.3-1Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M16 8.4v6.8M12.6 11.8h6.8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
