import { NextResponse } from "next/server";
import { getDispatchById } from "@/lib/data/repository";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const record = getDispatchById(params.id);

  if (!record) {
    return NextResponse.json({ error: "Dispatch not found" }, { status: 404 });
  }

  return NextResponse.json({ data: record });
}
