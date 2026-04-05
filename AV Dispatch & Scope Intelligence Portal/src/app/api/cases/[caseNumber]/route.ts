import { NextResponse } from "next/server";
import { getCaseByNumber } from "@/lib/data/repository";

export function GET(_: Request, { params }: { params: { caseNumber: string } }) {
  const item = getCaseByNumber(params.caseNumber);

  if (!item) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ data: item });
}
