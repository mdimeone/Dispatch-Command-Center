import { NextResponse } from "next/server";
import { getDataSourceMeta, getDispatches } from "@/lib/data/repository";

export function GET() {
  return NextResponse.json({
    data: getDispatches(),
    meta: {
      ...getDataSourceMeta()
    }
  });
}
