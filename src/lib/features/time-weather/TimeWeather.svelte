<!-- src/lib/features/time-weather/TimeWeather.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';

    // State management
    let currentTime = '--:--';
    let weather = {
        temp: '...',
        status: 'Loading...',
        feelsLike: '',
        pressure: '',
        humidity: '',
        wind: ''
    };
    let isLoading = true;
    let error = null;
    let interval;
    let retryCount = 0;
    const MAX_RETRIES = 2;
    const CACHE_EXPIRATION_MINUTES = 10;

    // Fetch weather data with retry logic and caching
    async function fetchWeather() {
        isLoading = true;
        error = null;
        
        // Check cache first
        const cachedData = getCachedWeather();
        if (cachedData) {
            weather = cachedData;
            isLoading = false;
            return;
        }
        
        const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=51.1694&longitude=71.4491&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&wind_speed_unit=ms';
        
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Weather API Error: ${errorData.reason || response.statusText}`);
            }
            
            const data = await response.json();
            const current = data.current;

            // Format weather data
            const newWeather = {
                temp: `${Math.round(current.temperature_2m)}°C`,
                status: getWeatherStatus(current.weather_code),
                feelsLike: `Feels like: ${Math.round(current.apparent_temperature)}°C`,
                pressure: `Pressure: ${Math.round(current.surface_pressure / 1.333)} mmHg`,
                humidity: `Humidity: ${current.relative_humidity_2m}%`,
                wind: `Wind: ${current.wind_speed_10m.toFixed(1)} m/s`
            };
            
            // Update state
            weather = newWeather;
            
            // Cache the result
            cacheWeather(newWeather);
            
            // Reset retry count on success
            retryCount = 0;
            
        } catch (err) {
            console.error("Weather fetch error:", err);
            error = err.message;
            
            // Retry logic
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchWeather();
            }
            
            // If all retries failed, show error
            weather.status = 'Unavailable';
            weather.temp = 'Error';
        } finally {
            isLoading = false;
        }
    }

    // Cache weather data in sessionStorage
    function cacheWeather(data) {
        try {
            const cache = {
                data,
                timestamp: new Date().getTime()
            };
            sessionStorage.setItem('weatherCache', JSON.stringify(cache));
        } catch (e) {
            console.warn("Failed to cache weather data", e);
        }
    }

    // Get cached weather data if valid
    function getCachedWeather() {
        try {
            const cache = JSON.parse(sessionStorage.getItem('weatherCache'));
            if (!cache) return null;
            
            // Check if cache is expired
            const now = new Date().getTime();
            const isExpired = (now - cache.timestamp) > (CACHE_EXPIRATION_MINUTES * 60 * 1000);
            
            return isExpired ? null : cache.data;
        } catch (e) {
            return null;
        }
    }

    // Update the local time every second
    function updateTime() {
        const now = new Date();
        const options = { timeZone: 'Asia/Almaty', hour: '2-digit', minute: '2-digit', hour12: false };
        currentTime = new Intl.DateTimeFormat('en-GB', options).format(now);
    }

    // Map weather codes to human-readable status
    function getWeatherStatus(code) {
        // WMO weather code mapping
        const statusMap = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            56: 'Light freezing drizzle',
            57: 'Dense freezing drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            66: 'Light freezing rain',
            67: 'Heavy freezing rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        
        return statusMap[code] || 'Cloudy';
    }

    onMount(() => {
        fetchWeather();
        updateTime();
        interval = setInterval(updateTime, 1000);
        
        // Refresh weather every 15 minutes
        const weatherRefresh = setInterval(fetchWeather, 15 * 60 * 1000);
        
        // Cleanup both intervals on destroy
        onDestroy(() => {
            clearInterval(interval);
            clearInterval(weatherRefresh);
        });
    });
</script>

<!-- [THE FIX IS HERE]: The entire component is now wrapped in the .vnk-sidebar-card div -->
<div class="vnk-sidebar-card">
    <div class="additional-content-header">
        <h2 class="sidebar-title">Current Conditions</h2>
    </div>
    <div class="spec-time-weather">
        <div class="local-time">
            <span class="local-time-title">Local Time (Almaty):</span>
            <span class="local-time-time">{currentTime}</span>
        </div>
        
        {#if isLoading}
            <!-- ... your loading HTML is unchanged ... -->
        {:else if error}
            <!-- ... your error HTML is unchanged ... -->
        {:else}
            <div class="weather">
                <span class="weather-title">Weather in Astana:</span>
                <span class="weather-temp">{weather.temp}</span>
                <span class="weather-status">{weather.status}</span>
                <span class="weather-other">{weather.feelsLike}</span>
                <div class="weather-inner">
                    <span class="weather-other">{weather.pressure}</span>
                    <span class="weather-other">{weather.humidity}</span>
                    <span class="weather-other">{weather.wind}</span>
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- [THE FIX IS HERE]: These are the exact card styles copied from KeyFacts.svelte -->
<style>
    .vnk-sidebar-card {
        background-color: var(--vnk-card-bg-glass);
        backdrop-filter: blur(12px);
        border: 1px solid var(--vnk-card-border-color);
        border-radius: var(--vnk-border-radius-lg);
        padding: var(--vnk-spacing-lg) var(--vnk-spacing-md);
        box-shadow: var(--vnk-shadow-depth);
    }
    .sidebar-title {
        color: var(--vnk-text-accent-color);
        text-shadow: var(--vnk-shadow-neon-sm);
        padding-bottom: var(--vnk-spacing-sm);
        margin: 0 0 var(--vnk-spacing-md) 0;
        font-size: 1.25rem;
        font-family: var(--vnk-font-primary);
        border-bottom: 1px solid var(--vnk-card-border-color);
    }
    
</style>