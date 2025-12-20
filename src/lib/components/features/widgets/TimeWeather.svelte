<!-- src/lib/features/time-weather/TimeWeather.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';

  export let city = 'Almaty';
  export let timeZone = 'Asia/Almaty';

  let currentTime = '--:--';
  let weather = { temp: '—', status: 'Loading…', feelsLike: '', pressure: '', humidity: '', wind: '' };
  let isLoading = true;
  let error = null;
  let timeInterval;
  let retryCount = 0;
  const MAX_RETRIES = 2;
  const CACHE_EXPIRATION_MINUTES = 10;
  const cacheKey = `weatherCache:${city.toLowerCase()}`;

  function updateTime() {
    const now = new Date();
    currentTime = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
  }

  function getWeatherStatus(code) {
    const map = {
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Cloudy',
      45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
      61: 'Rain', 63: 'Rain', 65: 'Rain', 66: 'Frz. rain', 67: 'Frz. rain',
      71: 'Snow', 73: 'Snow', 75: 'Snow', 77: 'Snow grains',
      80: 'Showers', 81: 'Showers', 82: 'Heavy showers',
      95: 'Thunderstorm', 96: 'Storm', 99: 'Storm'
    };
    return map[code] || 'Cloudy';
  }

  function cacheWeather(data) {
    try {
      const payload = { timestamp: Date.now(), data };
      sessionStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch {}
  }

  function getCachedWeather() {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const ageMin = (Date.now() - parsed.timestamp) / 60000;
      if (ageMin > CACHE_EXPIRATION_MINUTES) return null;
      return parsed.data;
    } catch { return null; }
  }

  async function fetchWeather() {
    isLoading = true;
    error = null;

    const cached = getCachedWeather();
    if (cached) {
      weather = cached;
      isLoading = false;
      return;
    }

    while (retryCount <= MAX_RETRIES) {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        weather = {
          temp: Math.round(data.temp) + '°C',
          status: getWeatherStatus(data.code),
          feelsLike: Math.round(data.feelsLike) + '°C',
          pressure: Math.round(data.pressure) + ' hPa',
          humidity: Math.round(data.humidity) + '%',
          wind: Math.round(data.wind) + ' m/s'
        };
        cacheWeather(weather);
        break;
      } catch (e) {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
          error = 'Weather unavailable';
          break;
        }
        await new Promise(r => setTimeout(r, 400 * retryCount));
      }
    }
    isLoading = false;
  }

  onMount(() => {
    updateTime();
    timeInterval = setInterval(updateTime, 1000);
    fetchWeather();
  });

  onDestroy(() => clearInterval(timeInterval));
</script>

<div class="tw-wrap">
  <div class="tw-row">
    <div class="tw-city" aria-hidden="true">{city}</div>
    <div class="tw-time" aria-label={`Local time in ${city}`}>{currentTime}</div>
    <div class="tw-status">{weather.status}</div>
  </div>
  <div class="tw-temp" aria-label={`Temperature in ${city}`}>{weather.temp}</div>
  {#if !isLoading && !error}
    <div class="tw-meta">
      <span title="Feels like">{weather.feelsLike}</span>
      <span title="Wind">{weather.wind}</span>
      <span title="Humidity">{weather.humidity}</span>
    </div>
  {:else if error}
    <div class="tw-error">{error}</div>
  {:else}
    <div class="tw-loading">Loading…</div>
  {/if}
</div>

<style>
:root {
  --tw-fg: #222;
  --tw-muted: #7c7c80;
  --tw-chip-bg: rgba(142,142,147,.12);
  --tw-chip-bd: #d1d1d6;
  --tw-temp: #0A84FF;
  --tw-card-bg: rgba(255,255,255,0.85);
  --tw-card-shadow: 0 8px 32px rgba(0,0,0,.12), 0 1.5px 6px rgba(0,0,0,.08);
}
@media (prefers-color-scheme:dark) {
  :root {
    --tw-fg: #f2f2f7;
    --tw-muted: #b2b2b8;
    --tw-chip-bg: rgba(180,180,185,.1);
    --tw-chip-bd: #3a3a3c;
    --tw-card-bg: rgba(28,28,30,0.82);
  }
}

.tw-wrap {
  font-family: -apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display",Segoe UI,Roboto,Inter,Arial,sans-serif;
  color: var(--tw-fg);
  background: var(--tw-card-bg);
  border-radius: 18px;
  box-shadow: var(--tw-card-shadow);
  padding: 18px 20px 14px 20px;
  min-width: 260px;
  max-width: 340px;
  border: 1px solid var(--tw-chip-bd);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
}

.tw-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.tw-city {
  font-size: 13px;
  font-weight: 600;
  color: var(--tw-muted);
  padding: 3px 10px;
  border: 1px solid var(--tw-chip-bd);
  background: var(--tw-chip-bg);
  border-radius: 999px;
  letter-spacing: .2px;
}

.tw-time {
  font-size: 21px;
  font-weight: 700;
  color: var(--tw-fg);
  letter-spacing: .4px;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 0 rgba(0,0,0,0.04);
}

.tw-status {
  font-size: 13px;
  font-weight: 600;
  color: var(--tw-muted);
  letter-spacing: .1px;
}

.tw-temp {
  margin-top: 2px;
  font-size: 38px;
  font-weight: 800;
  color: var(--tw-temp);
  letter-spacing: .3px;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 8px rgba(10,132,255,.08);
}

.tw-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: var(--tw-muted);
  font-weight: 500;
}
.tw-meta span + span::before {
  content: '•';
  margin: 0 8px 0 4px;
  color: var(--tw-chip-bd);
  font-size: 15px;
  vertical-align: middle;
}

.tw-error {
  margin-top: 8px;
  font-size: 13px;
  color: #d70015;
  font-weight: 600;
}

.tw-loading {
  margin-top: 8px;
  font-size: 13px;
  color: var(--tw-muted);
  font-style: italic;
}

/* Optional: Add icons for meta info (wind, humidity, etc.) */
.tw-meta span[title="Wind"]::before {
  content: "🌬️ ";
  font-size: 13px;
  margin-right: 2px;
}
.tw-meta span[title="Humidity"]::before {
  content: "💧 ";
  font-size: 13px;
  margin-right: 2px;
}
.tw-meta span[title="Feels like"]::before {
  content: "🌡️ ";
  font-size: 13px;
  margin-right: 2px;
}
</style>
