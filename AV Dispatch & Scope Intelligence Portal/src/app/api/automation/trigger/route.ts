import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    action: "automation-trigger",
    status: "accepted",
    receivedAt: new Date().toISOString(),
    input: body
  });
}
