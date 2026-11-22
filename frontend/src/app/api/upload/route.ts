import { NextResponse } from "next/server";
import { buildBackendHeaders, getBackendConfig } from "@/lib/backend";

export async function POST(req: Request) {
  try {
    const { url } = getBackendConfig();
    const formData = await req.formData();
    const headers = buildBackendHeaders(req);

    const response = await fetch(`${url}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Backend upload failed." },
      { status: 502 },
    );
  }
}
