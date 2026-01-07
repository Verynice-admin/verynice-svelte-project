<!-- src/lib/components/content/VideoEmbed.svelte (UPGRADED WITH SYNTAX FIX) -->

<script>
	/** @type {string} */
	export let title = 'Embedded Video';

	/** @type {string} */
	export let url = '';

	/**
	 * Takes a standard video URL (like youtube.com/watch?v=...) and
	 * converts it into the special embeddable URL that works in an iframe.
	 * @param {string} originalUrl
	 */
	function getEmbedUrl(originalUrl) {
		if (!originalUrl || typeof originalUrl !== 'string') return null;

		try {
			const urlObj = new URL(originalUrl);

			// Handle YouTube URLs
			if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
				let videoId = null;

				// Standard YouTube URL: youtube.com/watch?v=VIDEO_ID
				if (urlObj.searchParams.has('v')) {
					videoId = urlObj.searchParams.get('v');
				}
				// Short YouTube URL: youtu.be/VIDEO_ID
				else if (urlObj.hostname.includes('youtu.be')) {
					videoId = urlObj.pathname.split('/').pop();
				}
				// YouTube embed URL: youtube.com/embed/VIDEO_ID
				else if (urlObj.pathname.startsWith('/embed/')) {
					videoId = urlObj.pathname.split('/embed/').pop();
				}

				if (videoId) {
					// Remove any query parameters from video ID
					videoId = videoId.split('?')[0].split('&')[0];
					return `https://www.youtube.com/embed/${videoId}`;
				}
			}

			// Handle Vimeo URLs
			if (urlObj.hostname.includes('vimeo.com')) {
				const videoId = urlObj.pathname.split('/').pop();
				if (videoId && videoId !== '') {
					return `https://player.vimeo.com/video/${videoId}`;
				}
			}
		} catch (e) {
			console.error('Invalid URL for video embed:', originalUrl, e);
			return null;
		}

		// If URL doesn't match YouTube or Vimeo, return null (don't try to embed unknown URLs)
		console.warn('Video URL is not a supported format (YouTube or Vimeo):', originalUrl);
		return null;
	}

	$: embedUrl = getEmbedUrl(url);
</script>

<section id="video-section" class="themed-content-block">
	<div class="additional-content-header">
		<h2>{title}</h2>
	</div>

	{#if embedUrl}
		<div class="video-wrapper">
			<iframe
				src={embedUrl}
				{title}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullscreen
			></iframe>
		</div>
	{:else if url}
		<p style="text-align: center; padding: 2rem; color: #666;">
			The provided video URL is not valid. Please use a YouTube or Vimeo URL.
		</p>
	{:else}
		<div
			style="background: #f0f0f0; padding: 2rem; text-align: center; border: 1px dashed #ccc; margin: 1rem 0;"
		>
			<p style="color: #666; font-weight: bold;">Video Section Placeholder</p>
			<p style="color: #888;">No video source URL is currently configured for this destination.</p>
		</div>
	{/if}
</section>
