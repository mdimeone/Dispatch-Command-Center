import { NextResponse } from "next/server";
import { getDispatches } from "@/lib/data/repository";
import { getWeatherProviderStatus } from "@/lib/weather/provider";

export function GET() {
  return NextResponse.json({
    provider: getWeatherProviderStatus(),
    data: getDispatches().map((dispatch) => ({
      dispatchId: dispatch.id,
      caseNumber: dispatch.caseNumber,
      site: dispatch.site.name,
      weather: dispatch.weather
    }))
  });
}
