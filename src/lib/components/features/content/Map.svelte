<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { throttle, isElementInViewport } from '$lib/utils/domHelpers';

  // Dynamic imports to avoid SSR issues
  let L: any = null;
  let leafletLoaded = false;
  let leafletError = '';

	export let title = 'Location on Map';
	export let coordinates = null;
	export let mapProvider: 'osm' | '2gis' | 'auto' = 'auto';

	let mapContainer;
	let mapState = 'loading';
	let errorMessage = '';
	let mapInstance = null;
	let mapSection = null;
	let currentLat = 0;
	let currentLng = 0;

	const ASTANA_COORDINATES = { lat: 51.169392, lng: 71.449074 };
	const ALMATY_COORDINATES = { lat: 43.238949, lng: 76.889709 };

	let searchQuery = '';
	let isSearching = false;
	let searchError = '';
	let searchMarkers = [];

	async function loadLeaflet() {
		if (L) return L;
		
		console.log('[Map] Loading Leaflet library...');
		
		try {
			// Load Leaflet library and CSS
			const leaflet = await import('leaflet');
			await import('leaflet/dist/leaflet.css');
			L = leaflet.default;
			console.log('[Map] Leaflet loaded:', !!L);
			
			// Fix for default markers in Leaflet - use local images
			delete L.Icon.Default.prototype._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: '/images/marker-icon-2x.png',
				iconUrl: '/images/marker-icon.png',
				shadowUrl: '/images/marker-shadow.png',
			});
			
			leafletLoaded = true;
			console.log('[Map] Leaflet initialization complete');
			return L;
		} catch (err) {
			console.error('[Map] Failed to load Leaflet:', err);
			leafletError = err.message || 'Failed to load map library';
			mapState = 'error';
			throw err;
		}
	}

  async function initMap() {
		if (!browser || typeof window === 'undefined') {
			console.log('[Map] Not in browser, skipping init');
			return;
		}

		// Load Leaflet first
		try {
			await loadLeaflet();
		} catch (err) {
			console.error('[Map] Leaflet load failed:', err);
			errorMessage = 'Failed to load map library: ' + (err.message || 'Unknown error');
			mapState = 'error';
			return;
		}

		// Wait for container to be available
		const container = document.getElementById('map-container');
		if (!container) {
			console.warn('[Map] Container not found, retrying...');
			setTimeout(initMap, 200);
			return;
		}

		console.log('[Map] Container found, initializing map...');

 		let lat, lng;
 		if (coordinates && typeof coordinates === 'object') {
 			lat = coordinates.lat ?? coordinates.latitude;
 			lng = coordinates.lng ?? coordinates.longitude;
 		}

 		if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
 			if (title && /almaty/i.test(title)) {
 				lat = ALMATY_COORDINATES.lat;
 				lng = ALMATY_COORDINATES.lng;
 			} else {
 				lat = ASTANA_COORDINATES.lat;
 				lng = ASTANA_COORDINATES.lng;
 			}
 		}

 		currentLat = lat;
 		currentLng = lng;
 		const mapPosition = [lat, lng];

		try {
			console.log('[Map] Initializing Leaflet map...');

			container.innerHTML = '';

			// Check for 2GIS API key and determine provider
			const twoGisKey = (typeof window !== 'undefined') ? import.meta.env.VITE_2GIS_MAP_API_KEY : '';
			
			let selectedProvider = 'osm';
			if (mapProvider === 'auto') {
				// Auto-detect: use 2GIS if key exists, otherwise OSM
				selectedProvider = (twoGisKey && twoGisKey !== 'your_2gis_api_key_here') ? '2gis' : 'osm';
			} else if (mapProvider === '2gis' && twoGisKey && twoGisKey !== 'your_2gis_api_key_here') {
				selectedProvider = '2gis';
			} else {
				selectedProvider = 'osm';
			}

			console.log('[Map] Selected provider:', selectedProvider, '| Has 2GIS key:', !!twoGisKey && twoGisKey !== 'your_2gis_api_key_here');

			let tileLayer;
			if (selectedProvider === '2gis') {
				// Use 2GIS tiles (requires valid API key)
				tileLayer = L.tileLayer('https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&key=' + twoGisKey, {
					subdomains: '0123',
					attribution: '© 2GIS',
					maxZoom: 19
				});
			} else {
				// Use OpenStreetMap tiles (free, no API key)
				tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '© OpenStreetMap contributors',
					maxZoom: 19
				});
			}

 			mapInstance = L.map(container, {
 				center: mapPosition,
 				zoom: 12,
 				layers: [tileLayer],
 				zoomControl: true,
 				scrollWheelZoom: true
 			});

 			// Add main marker
 			const marker = L.marker(mapPosition).addTo(mapInstance);
 			if (title) {
 				marker.bindPopup(title);
 			}

 			// Try to get user location
 			if (navigator.geolocation) {
 				navigator.geolocation.getCurrentPosition(
 					(userPos) => {
 						const userLatLng = [userPos.coords.latitude, userPos.coords.longitude];
 						const userMarker = L.circleMarker(userLatLng, {
 							color: '#4285F4',
 							fillColor: '#4285F4',
 							fillOpacity: 1,
 							radius: 8
 						}).addTo(mapInstance);
 						userMarker.bindPopup('Your Location');
 					},
 					() => {
 						console.log('[Map] Could not get user location');
 					}
 				);
 			}

 			mapState = 'loaded';
 			mapSection = container.closest('section') || container.parentElement;
 			window.addEventListener('scroll', throttledScroll, { passive: true });

 			console.log('[Map] Leaflet map initialized successfully');

  		} catch (error) {
  			console.error('[Map] Error initializing map:', error);
  			errorMessage = `Map unavailable: ${error.message}`;
  			mapState = 'error';
  		}
  	}

 	function handleScroll() {
 		if (!mapInstance || !mapContainer) return;
 		const inView = isElementInViewport(mapSection || mapContainer);
 		if (inView) {
 			setTimeout(() => {
 				if (mapInstance) {
 					mapInstance.invalidateSize();
 				}
 			}, 100);
 		}
 	}

 	const throttledScroll = throttle(handleScroll, 100);

  onMount(() => {
 		setTimeout(() => {
 			initMap();
 		}, 100);
 	});

 	onDestroy(() => {
 		if (browser) {
 			window.removeEventListener('scroll', throttledScroll);
 			if (mapInstance) {
 				mapInstance.remove();
 				mapInstance = null;
 			}
 		}
 	});

  async function handleSearch() {
 		if (!searchQuery.trim()) return;
 		if (!mapInstance || !L) {
 			searchError = 'Map is not ready. Please wait for the map to load.';
 			return;
 		}

 		isSearching = true;
 		searchError = '';

 		// Clear previous search markers
 		searchMarkers.forEach(marker => mapInstance.removeLayer(marker));
 		searchMarkers = [];

 		const searchTerm = searchQuery.trim();

 		try {
 			// Use Nominatim (OpenStreetMap's geocoding service) for free geocoding
 			const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}, Kazakhstan&countrycodes=kz&limit=1`);
 			const results = await response.json();

 			if (results && results.length > 0) {
 				const result = results[0];
 				const lat = parseFloat(result.lat);
 				const lng = parseFloat(result.lon);

 				mapInstance.setView([lat, lng], 14);

 				const marker = L.marker([lat, lng]).addTo(mapInstance);
 				marker.bindPopup(`
 					<div style="padding: 12px; min-width: 200px;">
 						<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${result.display_name.split(',')[0]}</h3>
 						<p style="margin: 0; font-size: 12px; color: #666;">Location found in Kazakhstan</p>
 					</div>
 				`).openPopup();

 				searchMarkers.push(marker);
 			} else {
 				searchError = 'Location not found in Kazakhstan. Try a different search term.';
 			}
 		} catch (error) {
 			console.error('[Map] Search error:', error);
 			searchError = 'Search failed. Please try again.';
 		} finally {
 			isSearching = false;
 		}
 	}

 	function handleKeydown(event) {
 		if (event.key === 'Enter') {
 			handleSearch();
 		}
 	}
</script>

<section class="map-section" bind:this={mapSection}>
	<div class="map-header">
		<h2>{title}</h2>
		{#if mapState === 'loading'}
			<span class="loading-indicator">Loading map...</span>
		{:else if mapState === 'error'}
			<span class="error-message">{errorMessage}</span>
		{/if}
	</div>

	<div class="map-search">
		<input
			type="text"
			bind:value={searchQuery}
			on:keydown={handleKeydown}
			placeholder="Search location in Kazakhstan..."
			disabled={isSearching}
		/>
		<button on:click={handleSearch} disabled={isSearching || !searchQuery.trim()}>
			{isSearching ? 'Searching...' : 'Search'}
		</button>
	</div>
	{#if searchError}
		<p class="search-error">{searchError}</p>
	{/if}

  {#if browser}
 		<div
 			id="map-container"
 			class="map-container"
 			class:has-error={mapState === 'error'}
 		></div>
 	{:else}
 		<div class="map-container loading">
 			<p>Loading map...</p>
 		</div>
 	{/if}
</section>

<style>
	.map-section {
		position: relative;
		width: 100%;
		margin: 2rem 0;
		padding: 0;
	}

	.map-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.map-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #0f172a;
		text-shadow: none;
	}

	.loading-indicator {
		color: #64748b;
		font-size: 0.875rem;
	}

	.error-message {
		color: #ef4444;
		font-size: 0.875rem;
	}

	.error-message a {
		color: #3b82f6;
		text-decoration: underline;
	}

	.error-message a:hover {
		color: #2563eb;
	}

	.map-search {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.map-search input {
		flex: 1;
		padding: 0.5rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.map-search input:focus {
		outline: none;
		border-color: #0179b3;
		box-shadow: 0 0 0 3px rgba(1, 121, 179, 0.1);
	}

	.map-search button {
		padding: 0.5rem 1rem;
		background-color: #0179b3;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.map-search button:hover:not(:disabled) {
		background-color: #015f8f;
	}

	.map-search button:disabled {
		background-color: #94a3b8;
		cursor: not-allowed;
	}

	.search-error {
		color: #ef4444;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	/* Mobile-first: clean map container with proper sizing */
	.map-container {
		width: 100%;
		height: clamp(320px, 45vw, 520px);
		min-height: 320px;
		border-radius: 12px;
		overflow: hidden;
		background: #f1f5f9;
	}

	.map-container.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f1f5f9;
	}

	.map-container.loading::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite linear;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.map-container p {
		position: relative;
		z-index: 1;
		color: #64748b;
		font-size: 14px;
	}

	:global(.gm-err-container),
	:global(.gm-err-overlay) {
		display: none !important;
	}
</style>
