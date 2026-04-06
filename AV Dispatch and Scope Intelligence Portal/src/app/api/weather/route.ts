import { NextRequest, NextResponse } from "next/server";
import { getDispatches } from "@/lib/data/repository";
import {
  getWeatherProviderStatus,
  getWeatherSignalForCoordinates,
  getWeatherSignalForSite,
  resolveCoordinatesForSite
} from "@/lib/weather/provider";
import { resolveWeatherBatch } from "@/lib/weather/enrichment";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("lat");
  const longitude = searchParams.get("lon");
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const street = searchParams.get("street");
  const postalCode = searchParams.get("postalCode");
  const country = searchParams.get("country");

  try {
    if (latitude && longitude) {
      const parsedLatitude = Number(latitude);
      const parsedLongitude = Number(longitude);
      const weather = await getWeatherSignalForCoordinates(parsedLatitude, parsedLongitude);
      return NextResponse.json({
        provider: getWeatherProviderStatus(),
        mode: "coordinates",
        data: weather
      });
    }

    if (city && state) {
      const siteInput = {
        city,
        state,
        street: street || undefined,
        postalCode: postalCode || undefined,
        country: country || undefined
      };

      const coordinates = await resolveCoordinatesForSite(siteInput);
      const weather = await getWeatherSignalForSite(siteInput);
      return NextResponse.json({
        provider: getWeatherProviderStatus(),
        mode: "site",
        coordinates,
        data: weather
      });
    }

    const dispatches = getDispatches();
    const weatherRequests = dispatches.map((dispatch) => ({
      key: [
        dispatch.site.address?.street ?? "",
        dispatch.site.city,
        dispatch.site.state,
        dispatch.site.address?.postalCode ?? "",
        dispatch.site.address?.country ?? ""
      ]
        .map((part) => part.trim().toLowerCase())
        .join("|"),
      city: dispatch.site.city,
      state: dispatch.site.state,
      street: dispatch.site.address?.street,
      postalCode: dispatch.site.address?.postalCode,
      country: dispatch.site.address?.country,
      scheduledStart: dispatch.visitDate,
      fallbackWeather: dispatch.weather
    }));

    const weatherBySiteKey = await resolveWeatherBatch(weatherRequests);

    const data = dispatches.map((dispatch) => {
      const key = [
        dispatch.site.address?.street ?? "",
        dispatch.site.city,
        dispatch.site.state,
        dispatch.site.address?.postalCode ?? "",
        dispatch.site.address?.country ?? ""
      ]
        .map((part) => part.trim().toLowerCase())
        .join("|");

      const weather = weatherBySiteKey.get(key);

      return {
        dispatchId: dispatch.id,
        caseNumber: dispatch.caseNumber,
        site: dispatch.site.name,
        city: dispatch.site.city,
        state: dispatch.site.state,
        coordinates: weather?.coordinates ?? null,
        weather: weather?.weather ?? dispatch.weather,
        source: weather?.source ?? "fallback"
      };
    });

    return NextResponse.json({
      provider: getWeatherProviderStatus(),
      mode: "dispatches",
      data
    });
  } catch (error) {
    return NextResponse.json(
      {
        provider: getWeatherProviderStatus(),
        error: error instanceof Error ? error.message : "Unknown weather error"
      },
      { status: 500 }
    );
  }
}
