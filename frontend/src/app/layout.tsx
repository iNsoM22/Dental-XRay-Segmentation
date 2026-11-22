import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/instrument-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dent AI — Dental Image Intelligence",
  description:
    "Upload a dental radiograph to inspect AI-assisted segmentation and review detected findings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
