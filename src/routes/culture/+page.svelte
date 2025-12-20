<script>
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
</script>

<svelte:head>
	<title>Culture | VeryNice.kz</title>
	<meta name="description" content="Discover Kazakh culture, traditions, clothes, and ornaments." />
</svelte:head>

<div class="page-container">
	<SectionHeader title="Kazakh Culture" subtitle="Traditions, Clothes, and Ornaments" />

	<div class="themed-content-block">
		<p style="text-align: center; font-size: 1.2rem; color: #555;">
			Explore the rich heritage of Kazakhstan. (Coming Soon)
		</p>

		<div
			style="display: flex; gap: 2rem; justify-content: center; margin-top: 3rem; flex-wrap: wrap;"
		>
			<div class="feature-card">
				<h3>Clothes</h3>
				<p>Traditional Shapan, Saukele, and more.</p>
			</div>
			<div class="feature-card">
				<h3>Traditions</h3>
				<p>Hospitality, holidays, and customs.</p>
			</div>
			<div class="feature-card">
				<h3>Ornaments</h3>
				<p>Meaning behind the patterns.</p>
			</div>
		</div>
	</div>
</div>

<style>
	.page-container {
		padding-top: 80px; /* Space for fixed header */
		min-height: 80vh;
	}
	.feature-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 250px;
		text-align: center;
	}
	.feature-card h3 {
		color: #d4a373;
		margin-bottom: 0.5rem;
	}
</style>
