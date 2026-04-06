import { NextResponse } from "next/server";
import { getValidationQueue } from "@/lib/data/repository";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    action: "compare-to-bom",
    status: "sample-result",
    input: body,
    result: getValidationQueue()
  });
}
