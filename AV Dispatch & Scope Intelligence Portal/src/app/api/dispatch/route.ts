import { NextResponse } from "next/server";
import { getDispatches } from "@/lib/data/repository";

export function GET() {
  return NextResponse.json({
    data: getDispatches(),
    meta: {
      source: "sample"
    }
  });
}
