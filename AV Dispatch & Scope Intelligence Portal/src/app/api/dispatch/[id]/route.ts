import { NextResponse } from "next/server";
import { getDispatchById } from "@/lib/data/repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getDispatchById(id);

  if (!record) {
    return NextResponse.json({ error: "Dispatch not found" }, { status: 404 });
  }

  return NextResponse.json({ data: record });
}
