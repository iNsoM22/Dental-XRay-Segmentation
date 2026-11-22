import { NextResponse } from "next/server";
import { buildBackendHeaders, getBackendConfig } from "@/lib/backend";

export async function GET(
  req: Request,
  context: { params: Promise<{ fid: string }> },
) {
  try {
    const { fid } = await context.params;
    const { url } = getBackendConfig();
    const headers = buildBackendHeaders(req);

    const response = await fetch(`${url}/api/status/${encodeURIComponent(fid)}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to fetch status." },
      { status: 502 },
    );
  }
}
