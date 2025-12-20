<!-- src/lib/components/content/Map.svelte (FINAL, CORRECTED RACE CONDITION) -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { loadExternalScript } from '$lib/utils/loadExternalScript';
	import { throttle, isElementInViewport } from '$lib/utils/domHelpers';

	export let title = 'Location on Map';
	export let coordinates = null;

	let mapContainer; // This will bind to the permanent container div
	let mapState = 'loading'; // 'loading', 'error', or 'loaded'
	let errorMessage = '';
	let mapInstance = null; // Store the map instance for scroll updates
	let mapSection = null; // Reference to the section element

	// IMPORTANT: Ensure your Google Maps API Key is correct.
	// IMPORTANT: Ensure your Google Maps API Key is correct.
	const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	async function initMap() {
		if (!browser || !mapContainer) return;

		// Debug logging
		console.log('[Map Component] Initializing map with coordinates:', coordinates);
		console.log('[Map Component] Coordinates type:', typeof coordinates);
		console.log('[Map Component] Coordinates value:', coordinates);

		// 1. Check for valid coordinates and API key first
		// Default to Astana (Nur-Sultan) if no coordinates provided
		const ASTANA_COORDINATES = { lat: 51.169392, lng: 71.449074 };

		// Handle both object format and GeoPoint format from Firestore
		let lat, lng;
		if (coordinates && typeof coordinates === 'object') {
			// Firestore GeoPoint format
			if (coordinates.latitude !== undefined && coordinates.longitude !== undefined) {
				lat = coordinates.latitude;
				lng = coordinates.longitude;
			}
			// Standard format
			else if (coordinates.lat !== undefined && coordinates.lng !== undefined) {
				lat = coordinates.lat;
				lng = coordinates.lng;
			}
		}

		// Use Astana as fallback if coordinates are invalid
		if (typeof lat !== 'number' || typeof lng !== 'number') {
			console.warn('[Map Component] Invalid coordinates, using Astana as default');
			lat = ASTANA_COORDINATES.lat;
			lng = ASTANA_COORDINATES.lng;
		}

		// Coordinates are now validated above with Astana fallback

		// Coordinates are now validated above with Astana fallback
		if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' || !GOOGLE_MAPS_API_KEY) {
			errorMessage = 'Google Maps API Key is missing in the component.';
			mapState = 'error';
			return;
		}

		try {
			// 2. Load the Google Maps script
			console.log('[Map Component] Loading Google Maps script...');
			await loadExternalScript(
				`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
			);

			if (window.google && window.google.maps) {
				const mapPosition = { lat, lng };
				console.log('[Map Component] Creating map at position:', mapPosition);

				mapInstance = new window.google.maps.Map(mapContainer, {
					zoom: 12,
					center: mapPosition,
					disableDefaultUI: false,
					zoomControl: true,
					mapTypeControl: true,
					streetViewControl: false,
					fullscreenControl: true,
					gestureHandling: 'cooperative',
					scrollwheel: true, // Enable scroll to zoom
					draggable: true, // Enable dragging/panning
					gestureHandling: 'cooperative', // Require Ctrl/Cmd for scroll zoom, but allow dragging
					styles: [
						// Dark theme
						{ elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
						{ elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
						{ elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
						{
							featureType: 'administrative.locality',
							elementType: 'labels.text.fill',
							stylers: [{ color: '#d59563' }]
						},
						{
							featureType: 'poi',
							elementType: 'labels.text.fill',
							stylers: [{ color: '#d59563' }]
						},
						{ featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
						{
							featureType: 'poi.park',
							elementType: 'labels.text.fill',
							stylers: [{ color: '#6b9a76' }]
						},
						{ featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
						{
							featureType: 'road',
							elementType: 'geometry.stroke',
							stylers: [{ color: '#212a37' }]
						},
						{
							featureType: 'road',
							elementType: 'labels.text.fill',
							stylers: [{ color: '#9ca5b3' }]
						},
						{
							featureType: 'road.highway',
							elementType: 'geometry',
							stylers: [{ color: '#746855' }]
						},
						{
							featureType: 'road.highway',
							elementType: 'geometry.stroke',
							stylers: [{ color: '#1f2835' }]
						},
						{
							featureType: 'road.highway',
							elementType: 'labels.text.fill',
							stylers: [{ color: '#f3d19c' }]
						},
						{ featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
						{
							featureType: 'transit.station',
							elementType: 'labels.text.fill',
							stylers: [{ color: '#d59563' }]
						},
						{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
						{
							featureType: 'water',
							elementType: 'labels.text.fill',
							stylers: [{ color: '#515c6d' }]
						},
						{
							featureType: 'water',
							elementType: 'labels.text.stroke',
							stylers: [{ color: '#17263c' }]
						}
					]
				});

				// Add marker for Astana with custom icon
				const marker = new window.google.maps.Marker({
					position: mapPosition,
					map: mapInstance,
					title: 'Astana (Nur-Sultan) - Capital of Kazakhstan',
					animation: window.google.maps.Animation.DROP,
					optimized: false
				});

				// Add info window for Astana with more details
				const infoWindow = new window.google.maps.InfoWindow({
					content: `
						<div style="padding: 12px; min-width: 200px;">
							<h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #1a202c;">
								Astana (Nur-Sultan)
							</h3>
							<p style="margin: 0 0 8px 0; font-size: 14px; color: #4a5568; font-weight: 500;">
								Capital of Kazakhstan
							</p>
							<p style="margin: 0; font-size: 12px; color: #718096;">
								Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
							</p>
						</div>
					`
				});

				// Show info window automatically when map loads
				setTimeout(() => {
					infoWindow.open(mapInstance, marker);
				}, 500);

				// Also show info window on marker click
				marker.addListener('click', () => {
					infoWindow.open(mapInstance, marker);
				});

				// Add error listener for map tiles
				google.maps.event.addListenerOnce(mapInstance, 'tilesloaded', () => {
					console.log('[Map Component] Map tiles loaded successfully');
					console.log('[Map Component] Map centered on Astana:', mapPosition);
					mapState = 'loaded';
				});

				// Set loaded state after a short delay (in case tilesloaded doesn't fire)
				setTimeout(() => {
					if (mapState === 'loading') {
						console.log('[Map Component] Map initialized (timeout fallback)');
						mapState = 'loaded';
					}
				}, 1000);
			} else {
				throw new Error(
					'Google Maps library failed to load. Check API key and console for errors.'
				);
			}
		} catch (err) {
			console.error('Map initialization failed:', err);
			const errorMsg = err instanceof Error ? err.message : String(err);

			// Check for specific API key errors
			if (
				errorMsg.includes('API key') ||
				errorMsg.includes('referer') ||
				errorMsg.includes('domain')
			) {
				errorMessage =
					'Google Maps API key error. Check API key restrictions and ensure localhost is allowed.';
			} else {
				errorMessage = `Could not load the map: ${errorMsg}`;
			}
			mapState = 'error';
		}
	}

	// Scroll-based map behavior
	function handleScroll() {
		if (!browser || !mapInstance || !mapSection) return;

		const rect = mapSection.getBoundingClientRect();
		const windowHeight = window.innerHeight;

		// Check if map is in viewport
		const isInView = rect.top < windowHeight && rect.bottom > 0;

		if (isInView) {
			// Adjust zoom based on scroll position (subtle parallax effect)
			const scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
			const baseZoom = 10;
			const zoomRange = 2; // Zoom can vary by 2 levels
			const dynamicZoom = baseZoom + scrollProgress * zoomRange;

			// Only update if zoom change is significant to avoid constant updates
			const currentZoom = mapInstance.getZoom();
			if (Math.abs(currentZoom - dynamicZoom) > 0.3) {
				mapInstance.setZoom(Math.round(dynamicZoom));
			}
		}
	}

	const throttledScroll = throttle(handleScroll, 100);

	onMount(() => {
		initMap();
		if (browser) {
			// Get the section element for scroll tracking
			mapSection = mapContainer?.closest('section') || mapContainer?.parentElement;
			window.addEventListener('scroll', throttledScroll, { passive: true });
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('scroll', throttledScroll);
		}
	});

	// Location Search Logic using Google Geocoding API
	let searchQuery = '';
	let isSearching = false;
	let searchError = '';
	let searchMarkers = []; // Store markers to clear previous searches

	async function handleSearch() {
		if (!searchQuery.trim()) return;

		isSearching = true;
		searchError = '';

		try {
			if (!mapInstance || !window.google) {
				searchError = 'Map is not ready. Please wait for the map to load.';
				isSearching = false;
				return;
			}

			// Clear previous search markers
			searchMarkers.forEach((marker) => marker.setMap(null));
			searchMarkers = [];

			// Use Google Geocoding API (simpler and more reliable for location searches)
			const geocoder = new window.google.maps.Geocoder();
			const searchTerm = searchQuery.trim();

			// Try geocoding with region biasing toward Kazakhstan
			geocoder.geocode(
				{
					address: `${searchTerm}, Kazakhstan`,
					region: 'kz' // Bias results toward Kazakhstan
				},
				(results, status) => {
					isSearching = false;

					if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
						// Find the first result that is in Kazakhstan
						let kazakhstanResult = null;

						for (const result of results) {
							// Check if this result is in Kazakhstan
							const isKazakhstan = result.address_components.some((component) => {
								return (
									component.types.includes('country') &&
									(component.short_name === 'KZ' || component.long_name === 'Kazakhstan')
								);
							});

							if (isKazakhstan) {
								kazakhstanResult = result;
								break;
							}
						}

						// If no Kazakhstan result found, try the first result anyway (might still be correct)
						if (!kazakhstanResult && results.length > 0) {
							kazakhstanResult = results[0];
						}

						if (
							kazakhstanResult &&
							kazakhstanResult.geometry &&
							kazakhstanResult.geometry.location
						) {
							const position = kazakhstanResult.geometry.location;

							// Pan to location
							mapInstance.panTo(position);
							mapInstance.setZoom(14); // Closer zoom for specific locations

							// Add a marker
							const marker = new window.google.maps.Marker({
								position: position,
								map: mapInstance,
								title: kazakhstanResult.formatted_address,
								animation: window.google.maps.Animation.DROP
							});

							searchMarkers.push(marker);

							// Add info window
							const infoWindow = new window.google.maps.InfoWindow({
								content: `
								<div style="padding: 12px; min-width: 200px;">
									<h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #1a202c;">
										${kazakhstanResult.formatted_address}
									</h3>
									<p style="margin: 0; font-size: 12px; color: #718096;">
										Coordinates: ${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}
									</p>
								</div>
							`
							});

							infoWindow.open(mapInstance, marker);
							marker.addListener('click', () => infoWindow.open(mapInstance, marker));
						} else {
							searchError = 'Location not found in Kazakhstan. Please try a different search term.';
						}
					} else if (status === window.google.maps.GeocoderStatus.ZERO_RESULTS) {
						searchError = 'Location not found. Please try a different search term.';
					} else if (status === window.google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						searchError = 'Search quota exceeded. Please try again later.';
					} else if (status === window.google.maps.GeocoderStatus.REQUEST_DENIED) {
						searchError =
							'Geocoding request denied. Please check API key permissions and enable Geocoding API.';
					} else {
						searchError = `Could not find this location. Please try a different search term. (Status: ${status})`;
						console.error('Geocoding error:', status, results);
					}
				}
			);
		} catch (e) {
			console.error('Search failed:', e);
			searchError = 'Something went wrong. Please try again.';
			isSearching = false;
		}
	}
</script>

<section class="themed-content-block">
	<div class="additional-content-header">
		<h2>{title}</h2>
	</div>

	<!-- START WRAPPER -->
	<div class="map-wrapper">
		<!-- Google Maps Container -->
		<div class="map-container" bind:this={mapContainer}></div>

		<!-- Loading/Error Overlays (Sibling) -->
		{#if mapState === 'loading'}
			<div class="map-overlay">
				<p>Loading map...</p>
			</div>
		{:else if mapState === 'error'}
			<div class="map-overlay">
				<p class="error-message">⚠️ {errorMessage}</p>
			</div>
		{/if}
	</div>
	<!-- END WRAPPER -->

	<!-- Search Form Below Map -->
	<div class="map-search-below">
		<label for="location-search" class="search-label">Search for a location in Kazakhstan:</label>
		<form on:submit|preventDefault={handleSearch} class="search-form-below">
			<input
				id="location-search"
				type="text"
				bind:value={searchQuery}
				placeholder="Enter location name (e.g. 'Almaty', 'Baikonur', 'Shymkent')"
				disabled={isSearching}
				class="search-input-below"
			/>
			<button
				type="submit"
				disabled={isSearching || !searchQuery.trim()}
				class="search-button-below"
			>
				{#if isSearching}
					<span>Searching...</span>
				{:else}
					<span>Find</span>
				{/if}
			</button>
		</form>
		{#if searchError}
			<div class="search-error-below">{searchError}</div>
		{/if}
	</div>
</section>

<style>
	.themed-content-block {
		position: relative;
		transition: transform 0.1s ease-out;
	}

	/* Wrapper handles sizing and positioning context */
	.map-wrapper {
		position: relative;
		width: 100%;
		max-width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		border-radius: var(--vnk-border-radius-md);
		overflow: hidden;
		background-color: #1a202c;
		margin: 0 auto;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.map-container {
		width: 100%;
		height: 100%;
	}

	/* Add subtle scroll-based transform to wrapper, not inner container */
	.map-wrapper:hover {
		transform: scale(1.005);
		transition: transform 0.3s ease;
	}

	.map-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--vnk-text-secondary-color);
		font-family: var(--vnk-font-secondary);
		z-index: 10;
		background: rgba(26, 32, 44, 0.8); /* Semi-transparent bg for readability */
		pointer-events: none; /* Let clicks pass if just loading spinner */
	}
	.error-message {
		color: var(--vnk-error-color);
		padding: 1rem;
		text-align: center;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 8px;
		pointer-events: auto;
	}

	/* Search Form Below Map Styles */
	.map-search-below {
		margin-top: 2rem;
		margin-bottom: 1rem;
		width: 100%;
		max-width: 100%;
		display: block !important;
		visibility: visible !important;
		opacity: 1 !important;
		padding: 0;
	}

	.search-label {
		display: block;
		margin-bottom: 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		color: #4d4d4d !important;
		font-family: 'Roboto', 'Arial', sans-serif;
	}

	.search-form-below {
		display: flex !important;
		gap: 0.75rem;
		align-items: stretch;
		width: 100%;
		flex-direction: row;
	}

	.search-input-below {
		flex: 1;
		padding: 0.875rem 1rem;
		font-family: 'Roboto', 'Arial', sans-serif;
		font-size: 1rem;
		color: #1a202c !important;
		background: #ffffff !important;
		border: 2px solid #e2e8f0 !important;
		border-radius: 8px;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		display: block !important;
		visibility: visible !important;
		opacity: 1 !important;
		min-height: 44px;
		box-sizing: border-box;
	}

	.search-input-below:focus {
		border-color: #3498db !important;
		box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
	}

	.search-input-below::placeholder {
		color: #718096;
	}

	.search-input-below:disabled {
		background: #f7fafc !important;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.search-button-below {
		padding: 0.875rem 2rem;
		font-family: 'Roboto', 'Arial', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		color: #ffffff !important;
		background: #3498db !important;
		border: none !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.1s;
		white-space: nowrap;
		display: inline-block !important;
		visibility: visible !important;
		opacity: 1 !important;
		min-height: 44px;
		box-sizing: border-box;
	}

	.search-button-below:hover:not(:disabled) {
		background: #2980b9 !important;
		transform: translateY(-1px);
	}

	.search-button-below:active:not(:disabled) {
		transform: translateY(0);
	}

	.search-button-below:disabled {
		background: #bdc3c7 !important;
		cursor: not-allowed;
		transform: none;
	}

	.search-error-below {
		margin-top: 0.75rem;
		padding: 0.75rem 1rem;
		background: rgba(217, 48, 37, 0.1);
		color: #d93025 !important;
		border: 1px solid rgba(217, 48, 37, 0.3);
		border-radius: 8px;
		font-size: 0.9rem;
		text-align: center;
		display: block !important;
		visibility: visible !important;
	}
</style>
