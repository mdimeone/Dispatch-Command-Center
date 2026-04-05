import { NextResponse } from "next/server";
import { getDispatches } from "@/lib/data/repository";
import { getTrafficProviderStatus } from "@/lib/traffic/provider";

export function GET() {
  return NextResponse.json({
    provider: getTrafficProviderStatus(),
    data: getDispatches().map((dispatch) => ({
      dispatchId: dispatch.id,
      caseNumber: dispatch.caseNumber,
      site: dispatch.site.name,
      traffic: dispatch.traffic
    }))
  });
}
