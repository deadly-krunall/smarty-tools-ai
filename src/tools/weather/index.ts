/**
 * Weather tool — Open-Meteo (no API key required).
 * Resolves a city name to coordinates, then fetches current weather.
 */

export interface WeatherInput {
  city?: string;
  latitude?: number;
  longitude?: number;
}

/** Small offline table so common demo cities always resolve instantly. */
const KNOWN_CITIES: Record<string, { lat: number; lon: number; label: string }> = {
  ratnagiri: { lat: 16.9902, lon: 73.312, label: "Ratnagiri, India" },
  mumbai: { lat: 19.076, lon: 72.8777, label: "Mumbai, India" },
  pune: { lat: 18.5204, lon: 73.8567, label: "Pune, India" },
  delhi: { lat: 28.6139, lon: 77.209, label: "Delhi, India" },
  bengaluru: { lat: 12.9716, lon: 77.5946, label: "Bengaluru, India" },
  bangalore: { lat: 12.9716, lon: 77.5946, label: "Bengaluru, India" },
  london: { lat: 51.5072, lon: -0.1276, label: "London, United Kingdom" },
  "new york": { lat: 40.7128, lon: -74.006, label: "New York, United States" },
  tokyo: { lat: 35.6762, lon: 139.6503, label: "Tokyo, Japan" },
};

const WEATHER_CODES: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "foggy",
  48: "freezing fog",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  80: "rain showers",
  81: "heavy rain showers",
  82: "violent rain showers",
  95: "thunderstorm",
  96: "thunderstorm with hail",
  99: "severe thunderstorm with hail",
};

async function geocode(city: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const key = city.trim().toLowerCase();
  if (KNOWN_CITIES[key]) return KNOWN_CITIES[key];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as {
    results?: Array<{ latitude: number; longitude: number; name: string; country?: string }>;
  };
  const hit = data.results?.[0];
  if (!hit) return null;
  return {
    lat: hit.latitude,
    lon: hit.longitude,
    label: hit.country ? `${hit.name}, ${hit.country}` : hit.name,
  };
}

export async function runWeather(input: WeatherInput): Promise<string> {
  try {
    let label = "the requested location";
    let lat = typeof input.latitude === "number" ? input.latitude : undefined;
    let lon = typeof input.longitude === "number" ? input.longitude : undefined;

    if ((lat === undefined || lon === undefined) && input.city) {
      const place = await geocode(input.city);
      if (!place) {
        return `Error: I could not find a place called "${input.city}". Please try another city name.`;
      }
      lat = place.lat;
      lon = place.lon;
      label = place.label;
    } else if (input.city) {
      label = input.city;
    }

    if (lat === undefined || lon === undefined) {
      return "Error: no location was provided, so I cannot check the weather.";
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    );
    if (!response.ok) {
      return "Error: the weather service is not responding right now. Please try again in a moment.";
    }
    const data = (await response.json()) as {
      current_weather?: { temperature: number; windspeed: number; weathercode: number };
    };
    const current = data.current_weather;
    if (!current) {
      return "Error: the weather service returned no current conditions for that location.";
    }

    const description = WEATHER_CODES[current.weathercode] ?? `weather code ${current.weathercode}`;
    return `Weather in ${label}: ${current.temperature}°C, ${description}, wind ${current.windspeed} km/h.`;
  } catch {
    return "Error: the weather lookup failed because of a network problem. Please try again.";
  }
}
