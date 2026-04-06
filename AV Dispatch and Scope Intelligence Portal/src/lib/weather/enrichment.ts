import "server-only";

import { WeatherSignal } from "@/types/domain";
import { getWeatherSignalForCoordinates, resolveCoordinatesForSite } from "@/lib/weather/provider";

export interface WeatherBatchRequest {
  key: string;
  city: string;
  state: string;
  street?: string;
  postalCode?: string;
  country?: string;
  scheduledStart?: string;
  fallbackWeather: WeatherSignal;
}

export interface WeatherBatchResult {
  coordinates: { latitude: number; longitude: number } | null;
  weather: WeatherSignal;
  source: "weather.gov" | "fallback";
}

interface BatchOptions {
  concurrency?: number;
}

export async function resolveWeatherBatch(
  requests: WeatherBatchRequest[],
  options: BatchOptions = {}
): Promise<Map<string, WeatherBatchResult>> {
  const dedupedRequests = new Map<string, WeatherBatchRequest>();
  for (const request of requests) {
    if (!dedupedRequests.has(request.key)) {
      dedupedRequests.set(request.key, request);
    }
  }

  const uniqueRequests = [...dedupedRequests.values()];
  const concurrency = clampConcurrency(options.concurrency ?? Number(process.env.WEATHER_BATCH_CONCURRENCY ?? 6));
  const results = await mapWithConcurrency(uniqueRequests, concurrency, async (request) => {
    const fallback: WeatherBatchResult = {
      coordinates: null,
      weather: request.fallbackWeather,
      source: "fallback"
    };

    try {
      const coordinates = await resolveCoordinatesForSite({
        city: request.city,
        state: request.state,
        street: request.street,
        postalCode: request.postalCode,
        country: request.country
      });

      if (!coordinates) {
        return [request.key, fallback] as const;
      }

      const weather = await getWeatherSignalForCoordinates(
        coordinates.latitude,
        coordinates.longitude,
        request.scheduledStart
      );

      return [
        request.key,
        {
          coordinates,
          weather,
          source: "weather.gov"
        }
      ] as const;
    } catch {
      return [request.key, fallback] as const;
    }
  });

  return new Map(results);
}

function clampConcurrency(value: number) {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.min(Math.floor(value), 12);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await worker(items[currentIndex]);
    }
  });

  await Promise.all(runners);
  return results;
}
