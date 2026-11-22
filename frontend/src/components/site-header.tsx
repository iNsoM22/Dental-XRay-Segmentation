"use client";

import { useRef } from "react";
import Link from "next/link";
import { BrandMark } from "./brand";
import { BackIcon, PlusIcon } from "./icons";

export function SiteHeader({
  onHome,
  onChangeImage,
}: {
  onHome?: () => void;
  onChangeImage?: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="site-header shell">
      <Link
        className="brand"
        href="/"
        aria-label="Dent AI home"
        onClick={(event) => {
          if (!onHome) return;
          event.preventDefault();
          onHome();
        }}
      >
        <span className="brand-mark">
          <BrandMark size={22} />
        </span>
        <span className="brand-word">
          dent<em>ai</em>
        </span>
      </Link>

      {onHome && onChangeImage && (
        <div className="header-actions">
          <button
            className="btn-outline"
            type="button"
            onClick={onHome}
            aria-label="Back to upload screen"
          >
            <BackIcon size={15} />
            <span>Back</span>
          </button>

          <button
            className="btn-outline"
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            <PlusIcon size={14} />
            <span>Change image</span>
          </button>

          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onChangeImage(file);
              event.target.value = "";
            }}
          />
        </div>
      )}
    </header>
  );
}
