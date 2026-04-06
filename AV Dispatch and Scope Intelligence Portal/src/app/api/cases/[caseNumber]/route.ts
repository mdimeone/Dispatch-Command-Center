import { NextResponse } from "next/server";
import { getCaseByNumber } from "@/lib/data/repository";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ caseNumber: string }> }
) {
  const { caseNumber } = await params;
  const item = getCaseByNumber(caseNumber);

  if (!item) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ data: item });
}
