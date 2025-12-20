import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface GeocodingResult {
  results?: Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>;
}

interface WeatherResponse {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    pressure_msl: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
  };
}

export const GET: RequestHandler = async ({ url, fetch, setHeaders }) => {
  const city = url.searchParams.get('city')?.trim() || 'Almaty';

  // 1) Geocode city -> lat/lon
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  if (!geoRes.ok) return json({ error: 'Geocoding failed' }, { status: 502 });
  
  const geo = (await geoRes.json()) as GeocodingResult;
  const place = geo?.results?.[0];
  if (!place) return json({ error: 'City not found' }, { status: 404 });

  const { latitude, longitude } = place;

  // 2) Current weather
  const wxUrl = new URL('https://api.open-meteo.com/v1/forecast');
  wxUrl.searchParams.set('latitude', latitude.toString());
  wxUrl.searchParams.set('longitude', longitude.toString());
  wxUrl.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,relative_humidity_2m'
  );
  wxUrl.searchParams.set('timezone', 'auto');

  const wxRes = await fetch(wxUrl.toString());
  if (!wxRes.ok) return json({ error: 'Weather fetch failed' }, { status: 502 });
  const wx = (await wxRes.json()) as WeatherResponse;
  const c = wx.current ?? {
    temperature_2m: 0,
    apparent_temperature: 0,
    weather_code: 0,
    pressure_msl: 0,
    wind_speed_10m: 0,
    relative_humidity_2m: 0
  };

  // Cache on the edge/client for 10 minutes
  setHeaders({
    'Cache-Control': 'public, max-age=600'
  });

  return json({
    city: place.name,
    country: place.country,
    lat: latitude,
    lon: longitude,
    temp: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    code: c.weather_code,
    pressure: c.pressure_msl,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m
  });
};

