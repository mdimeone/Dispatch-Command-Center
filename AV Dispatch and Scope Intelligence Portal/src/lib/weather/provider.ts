import "server-only";

import { WeatherSignal } from "@/types/domain";

const NWS_API_BASE = "https://api.weather.gov";
const CENSUS_GEOCODER_BASE = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
const DEFAULT_USER_AGENT =
  process.env.WEATHER_USER_AGENT ||
  `${process.env.APP_NAME || "AV Dispatch and Scope Intelligence Portal"} (${process.env.WEATHER_CONTACT_EMAIL || "support@example.com"})`;

const COORDINATE_CACHE_TTL_MS = Number(process.env.WEATHER_COORDINATE_CACHE_TTL_MS ?? 24 * 60 * 60 * 1000);
const WEATHER_CACHE_FRESH_TTL_MS = Number(process.env.WEATHER_CACHE_TTL_MS ?? 10 * 60 * 1000);
const WEATHER_CACHE_STALE_TTL_MS = Number(process.env.WEATHER_CACHE_STALE_TTL_MS ?? 30 * 60 * 1000);
const MAX_FETCH_CONCURRENCY = clampConcurrency(Number(process.env.WEATHER_FETCH_CONCURRENCY ?? 8));

interface CoordinateCacheEntry {
  value: { latitude: number; longitude: number };
  expiresAt: number;
}

interface WeatherCacheEntry {
  value: WeatherSignal;
  freshUntil: number;
  staleUntil: number;
}

const coordinateCache = new Map<string, CoordinateCacheEntry>();
const weatherCache = new Map<string, WeatherCacheEntry>();

const inflightCoordinateLookups = new Map<string, Promise<{ latitude: number; longitude: number } | null>>();
const inflightWeatherLookups = new Map<string, Promise<WeatherSignal>>();

const fetchLimiterQueue: Array<() => void> = [];
let activeFetchRequests = 0;

const CITY_STATE_OVERRIDES: Record<string, { latitude: number; longitude: number }> = {
  "malvern,pa": { latitude: 40.0362, longitude: -75.5138 },
  "new york,ny": { latitude: 40.7128, longitude: -74.006 },
  "new york city,ny": { latitude: 40.7128, longitude: -74.006 },
  "raleigh,nc": { latitude: 35.7796, longitude: -78.6382 },
  "nashville,tn": { latitude: 36.1627, longitude: -86.7816 },
  "washington,dc": { latitude: 38.9072, longitude: -77.0369 },
  "atlanta,ga": { latitude: 33.749, longitude: -84.388 },
  "chicago,il": { latitude: 41.8781, longitude: -87.6298 },
  "los angeles,ca": { latitude: 34.0549, longitude: -118.2426 },
  "miami,fl": { latitude: 25.7617, longitude: -80.1918 },
  "houston,tx": { latitude: 29.7604, longitude: -95.3698 },
  "dallas,tx": { latitude: 32.7767, longitude: -96.797 },
  "seattle,wa": { latitude: 47.6062, longitude: -122.3321 },
  "san francisco,ca": { latitude: 37.7749, longitude: -122.4194 },
  "san jose,ca": { latitude: 37.3382, longitude: -121.8863 },
  "sacramento,ca": { latitude: 38.5816, longitude: -121.4944 },
  "birmingham,al": { latitude: 33.5186, longitude: -86.8104 },
  "charlotte,nc": { latitude: 35.2271, longitude: -80.8431 },
  "orlando,fl": { latitude: 28.5383, longitude: -81.3792 },
  "west palm beach,fl": { latitude: 26.7153, longitude: -80.0534 },
  "boca raton,fl": { latitude: 26.3683, longitude: -80.1289 },
  "oakland,ca": { latitude: 37.8044, longitude: -122.2712 },
  "new haven,ct": { latitude: 41.3083, longitude: -72.9279 },
  "rochester,ny": { latitude: 43.1566, longitude: -77.6088 },
  "victor,ny": { latitude: 42.9826, longitude: -77.4089 },
  "warwick,ri": { latitude: 41.7001, longitude: -71.4162 },
  "bridgewater,ma": { latitude: 41.9904, longitude: -70.9756 },
  "coral gables,fl": { latitude: 25.7215, longitude: -80.2684 },
  "merritt island,fl": { latitude: 28.3181, longitude: -80.6664 },
  "rockville,md": { latitude: 39.084, longitude: -77.1528 },
  "arlington,tx": { latitude: 32.7357, longitude: -97.1081 },
  "moon township,pa": { latitude: 40.5167, longitude: -80.2212 },
  "highland park,il": { latitude: 42.1817, longitude: -87.8003 },
  "prattville,al": { latitude: 32.464, longitude: -86.4597 },
  "crown point,in": { latitude: 41.4169, longitude: -87.3653 },
  "mukilteo,wa": { latitude: 47.9474, longitude: -122.3035 },
  "indianapolis,in": { latitude: 39.7684, longitude: -86.1581 },
  "conshohocken,pa": { latitude: 40.0793, longitude: -75.3016 },
  "waltham,ma": { latitude: 42.3765, longitude: -71.2356 },
  "rye,ny": { latitude: 40.9807, longitude: -73.6837 },
  "corvallis,or": { latitude: 44.5646, longitude: -123.262 },
  "santa monica,ca": { latitude: 34.0195, longitude: -118.4912 },
  "palo alto,ca": { latitude: 37.4419, longitude: -122.143 },
  "phoenix,az": { latitude: 33.4484, longitude: -112.074 },
  "coraopolis,pa": { latitude: 40.5184, longitude: -80.1667 },
  "tonawanda,ny": { latitude: 43.0109, longitude: -78.88 },
  "newark,nj": { latitude: 40.7357, longitude: -74.1724 },
  "whippany,nj": { latitude: 40.8245, longitude: -74.4171 }
};

interface NwsPointsResponse {
  properties: {
    forecast: string;
    forecastHourly: string;
  };
}

interface NwsForecastResponse {
  properties: {
    periods: Array<{
      name: string;
      temperature: number;
      temperatureUnit: string;
      shortForecast: string;
      detailedForecast: string;
      isDaytime: boolean;
      startTime?: string;
      endTime?: string;
    }>;
  };
}

interface CensusGeocoderResponse {
  result: {
    addressMatches: Array<{
      coordinates: {
        x: number;
        y: number;
      };
    }>;
  };
}

export function getWeatherProviderStatus() {
  return {
    provider: "weather.gov",
    mode: "live-nws",
    note: "Uses the National Weather Service API with U.S. address geocoding and no API key.",
    baseUrl: NWS_API_BASE,
    geocoder: "U.S. Census Geocoder",
    cache: {
      coordinateTtlMs: COORDINATE_CACHE_TTL_MS,
      weatherTtlMs: WEATHER_CACHE_FRESH_TTL_MS,
      weatherStaleTtlMs: WEATHER_CACHE_STALE_TTL_MS
    }
  };
}

export async function resolveCoordinatesForSite(input: {
  city: string;
  state: string;
  street?: string;
  postalCode?: string;
  country?: string;
}) {
  const city = normalizeToken(input.city);
  const state = normalizeToken(input.state).toUpperCase();
  const country = normalizeToken(input.country || "United States");
  const cacheKey = [normalizeToken(input.street || ""), city, state, normalizeToken(input.postalCode || "")].join("|");

  if (!city || !state) {
    return null;
  }

  const now = Date.now();
  const cached = coordinateCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const existingLookup = inflightCoordinateLookups.get(cacheKey);
  if (existingLookup) {
    return existingLookup;
  }

  const lookupPromise = (async () => {
    const override = CITY_STATE_OVERRIDES[`${city},${state.toLowerCase()}`];
    if (override) {
      coordinateCache.set(cacheKey, {
        value: override,
        expiresAt: now + COORDINATE_CACHE_TTL_MS
      });
      return override;
    }

    if (!isUsLocation(country, state)) {
      return null;
    }

    const query = [input.street, input.city, input.state, input.postalCode].filter(Boolean).join(", ");
    if (!query) {
      return null;
    }

    const geocodeUrl = `${CENSUS_GEOCODER_BASE}?address=${encodeURIComponent(query)}&benchmark=Public_AR_Current&format=json`;
    const geocode = await fetchJson<CensusGeocoderResponse>(geocodeUrl, "application/json");
    const match = geocode.result.addressMatches[0];

    if (!match) {
      return null;
    }

    const coordinates = {
      latitude: match.coordinates.y,
      longitude: match.coordinates.x
    };

    coordinateCache.set(cacheKey, {
      value: coordinates,
      expiresAt: Date.now() + COORDINATE_CACHE_TTL_MS
    });

    return coordinates;
  })();

  inflightCoordinateLookups.set(cacheKey, lookupPromise);

  try {
    return await lookupPromise;
  } finally {
    inflightCoordinateLookups.delete(cacheKey);
  }
}

export async function getWeatherSignalForCoordinates(
  latitude: number,
  longitude: number,
  scheduledStart?: string
): Promise<WeatherSignal> {
  const cacheKey = buildWeatherCacheKey(latitude, longitude, scheduledStart);
  const now = Date.now();

  const cached = weatherCache.get(cacheKey);
  if (cached && cached.freshUntil > now) {
    return cached.value;
  }

  if (cached && cached.staleUntil > now) {
    void refreshWeatherInBackground(cacheKey, latitude, longitude, scheduledStart);
    return cached.value;
  }

  const existingLookup = inflightWeatherLookups.get(cacheKey);
  if (existingLookup) {
    return existingLookup;
  }

  const lookupPromise = fetchWeatherFromProvider(latitude, longitude, scheduledStart)
    .then((weather) => {
      setWeatherCache(cacheKey, weather);
      return weather;
    })
    .finally(() => {
      inflightWeatherLookups.delete(cacheKey);
    });

  inflightWeatherLookups.set(cacheKey, lookupPromise);
  return lookupPromise;
}

export async function getWeatherSignalForSite(input: {
  city: string;
  state: string;
  street?: string;
  postalCode?: string;
  country?: string;
  scheduledStart?: string;
}) {
  const coordinates = await resolveCoordinatesForSite(input);

  if (!coordinates) {
    return null;
  }

  return getWeatherSignalForCoordinates(coordinates.latitude, coordinates.longitude, input.scheduledStart);
}

async function refreshWeatherInBackground(
  cacheKey: string,
  latitude: number,
  longitude: number,
  scheduledStart?: string
) {
  if (inflightWeatherLookups.has(cacheKey)) {
    return;
  }

  const lookupPromise = fetchWeatherFromProvider(latitude, longitude, scheduledStart)
    .then((weather) => {
      setWeatherCache(cacheKey, weather);
      return weather;
    })
    .finally(() => {
      inflightWeatherLookups.delete(cacheKey);
    });

  inflightWeatherLookups.set(cacheKey, lookupPromise);

  try {
    await lookupPromise;
  } catch {
    // Preserve stale weather on background refresh errors.
  }
}

function setWeatherCache(cacheKey: string, value: WeatherSignal) {
  const now = Date.now();
  weatherCache.set(cacheKey, {
    value,
    freshUntil: now + WEATHER_CACHE_FRESH_TTL_MS,
    staleUntil: now + WEATHER_CACHE_STALE_TTL_MS
  });
}

async function fetchWeatherFromProvider(
  latitude: number,
  longitude: number,
  scheduledStart?: string
): Promise<WeatherSignal> {
  const points = await fetchJson<NwsPointsResponse>(`${NWS_API_BASE}/points/${latitude},${longitude}`);
  const forecastUrl = scheduledStart ? points.properties.forecastHourly : points.properties.forecast;
  const forecast = await fetchJson<NwsForecastResponse>(forecastUrl);
  const selectedPeriod = selectForecastPeriod(forecast.properties.periods, scheduledStart);

  if (!selectedPeriod) {
    throw new Error("No forecast periods returned by weather.gov");
  }

  return {
    summary: selectedPeriod.shortForecast,
    temperatureF:
      selectedPeriod.temperatureUnit === "F"
        ? selectedPeriod.temperature
        : Math.round((selectedPeriod.temperature * 9) / 5 + 32),
    severeRisk: inferSevereRisk(`${selectedPeriod.shortForecast} ${selectedPeriod.detailedForecast}`)
  };
}

async function fetchJson<T>(url: string, accept = "application/geo+json, application/json"): Promise<T> {
  return runWithFetchLimit(async () => {
    const response = await fetch(url, {
      headers: {
        Accept: accept,
        "User-Agent": DEFAULT_USER_AGENT
      },
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  });
}

async function runWithFetchLimit<T>(work: () => Promise<T>): Promise<T> {
  await acquireFetchSlot();

  try {
    return await work();
  } finally {
    releaseFetchSlot();
  }
}

function acquireFetchSlot() {
  if (activeFetchRequests < MAX_FETCH_CONCURRENCY) {
    activeFetchRequests += 1;
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    fetchLimiterQueue.push(() => {
      activeFetchRequests += 1;
      resolve();
    });
  });
}

function releaseFetchSlot() {
  activeFetchRequests = Math.max(0, activeFetchRequests - 1);
  const next = fetchLimiterQueue.shift();
  if (next) {
    next();
  }
}

function buildWeatherCacheKey(latitude: number, longitude: number, scheduledStart?: string) {
  const roundedLat = latitude.toFixed(3);
  const roundedLon = longitude.toFixed(3);

  if (!scheduledStart) {
    return `${roundedLat},${roundedLon}|current`;
  }

  const parsedStart = new Date(scheduledStart);
  if (Number.isNaN(parsedStart.getTime())) {
    return `${roundedLat},${roundedLon}|current`;
  }

  const hourBucket = new Date(parsedStart);
  hourBucket.setMinutes(0, 0, 0);

  return `${roundedLat},${roundedLon}|${hourBucket.toISOString()}`;
}

function selectForecastPeriod(
  periods: NwsForecastResponse["properties"]["periods"],
  scheduledStart?: string
) {
  if (!periods.length) {
    return null;
  }

  if (!scheduledStart) {
    return periods[0];
  }

  const target = new Date(scheduledStart);
  if (Number.isNaN(target.getTime())) {
    return periods[0];
  }

  const exact = periods.find((period) => {
    if (!period.startTime || !period.endTime) {
      return false;
    }

    const start = new Date(period.startTime);
    const end = new Date(period.endTime);
    return start.getTime() <= target.getTime() && target.getTime() < end.getTime();
  });

  if (exact) {
    return exact;
  }

  return [...periods].sort((a, b) => {
    const aTime = a.startTime
      ? Math.abs(new Date(a.startTime).getTime() - target.getTime())
      : Number.MAX_SAFE_INTEGER;
    const bTime = b.startTime
      ? Math.abs(new Date(b.startTime).getTime() - target.getTime())
      : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  })[0];
}

function inferSevereRisk(text: string): WeatherSignal["severeRisk"] {
  if (/(severe|thunderstorm|tornado|flood|ice storm|blizzard|high wind)/i.test(text)) {
    return "High";
  }

  if (/(rain|snow|showers|wind|gust|fog|advisory|cloud)/i.test(text)) {
    return "Moderate";
  }

  return "Low";
}

function isUsLocation(country: string, state: string) {
  return country === "united states" || Boolean(state && state.length === 2);
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function clampConcurrency(value: number) {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.min(Math.floor(value), 20);
}
