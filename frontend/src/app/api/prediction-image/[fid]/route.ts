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

    const response = await fetch(
      `${url}/api/prediction-image/${encodeURIComponent(fid)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return NextResponse.json(data, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Failed to fetch prediction image.",
      },
      { status: 502 },
    );
  }
}
