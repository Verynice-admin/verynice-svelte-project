<!-- src/lib/components/content/Map.svelte (FINAL, CORRECTED RACE CONDITION) -->
<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { loadScript } from '$lib/utils/scriptLoader.js';

    export let title = "Location on Map";
    export let coordinates = null;

    let mapContainer; // This will bind to the permanent container div
    let mapState = 'loading'; // 'loading', 'error', or 'loaded'
    let errorMessage = '';

    // IMPORTANT: Ensure your Google Maps API Key is correct.
    const GOOGLE_MAPS_API_KEY = 'AIzaSyCRxalThhGrM0alsQl-QN4OwyItGrqcHE0';

    async function initMap() {
        if (!browser || !mapContainer) return;

        // 1. Check for valid coordinates and API key first
        if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
            errorMessage = "Map coordinates were not provided correctly from the database.";
            mapState = 'error';
            return;
        }
        if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' || !GOOGLE_MAPS_API_KEY) {
            errorMessage = "Google Maps API Key is missing in the component.";
            mapState = 'error';
            return;
        }

        try {
            // 2. Load the Google Maps script
            await loadScript(`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`);
            
            if (window.google && window.google.maps) {
                const mapPosition = { lat: coordinates.lat, lng: coordinates.lng };
                
                const map = new window.google.maps.Map(mapContainer, {
                    zoom: 12,
                    center: mapPosition,
                    disableDefaultUI: true,
                    styles: [ // Dark theme
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
                        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
                        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
                        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
                        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
                        { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                        { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
                    ]
                });

                new window.google.maps.Marker({
                    position: mapPosition,
                    map: map,
                    title: "Astana",
                });
                // 3. Set the state to 'loaded' on success
                mapState = 'loaded';
            } else {
                throw new Error("Google Maps library failed to load.");
            }
        } catch (err) {
            console.error("Map initialization failed:", err);
            errorMessage = "Could not load the map. Check console for API key errors.";
            mapState = 'error';
        }
    }

    onMount(initMap);
</script>

<section class="themed-content-block">
    <div class="additional-content-header">
        <h2>{title}</h2>
    </div>

    <!-- This container now ALWAYS exists, solving the race condition -->
    <div class="map-container" bind:this={mapContainer}>
        <!-- The loading/error messages are now overlays -->
        {#if mapState === 'loading'}
            <div class="map-overlay">
                <p>Loading map...</p>
            </div>
        {:else if mapState === 'error'}
            <div class="map-overlay">
                <p class="error-message">⚠️ {errorMessage}</p>
            </div>
        {/if}
        <!-- When loaded, the overlays are gone and the map (in the background) is visible -->
    </div>
</section>

<style>
    .map-container {
        position: relative; /* Crucial for positioning the overlay */
        height: 450px;
        width: 100%;
        border-radius: var(--vnk-border-radius-md);
        overflow: hidden;
        background-color: #1a202c; /* Dark background for loading/error state */
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
    }
    .error-message {
        color: var(--vnk-error-color);
        padding: 1rem;
        text-align: center;
    }
</style>