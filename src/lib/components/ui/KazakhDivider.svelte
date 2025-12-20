<script>
	export let type = 'default'; // 'default', 'simple', 'ornate'
</script>

<div class="kazakh-divider" class:simple={type === 'simple'} class:ornate={type === 'ornate'}>
	{#if type === 'simple'}
		<!-- Simple geometric pattern -->
		<svg viewBox="0 0 400 40" xmlns="http://www.w3.org/2000/svg">
			<g fill="none" stroke="currentColor" stroke-width="2">
				<!-- Center diamond -->
				<path d="M 200 10 L 210 20 L 200 30 L 190 20 Z" fill="currentColor" opacity="0.3" />

				<!-- Side lines -->
				<line x1="10" y1="20" x2="180" y2="20" />
				<line x1="220" y1="20" x2="390" y2="20" />

				<!-- Small diamonds -->
				<path d="M 150 15 L 155 20 L 150 25 L 145 20 Z" />
				<path d="M 250 15 L 255 20 L 250 25 L 245 20 Z" />
			</g>
		</svg>
	{:else if type === 'ornate'}
		<!-- Ornate traditional pattern -->
		<svg viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg">
			<g fill="currentColor" opacity="0.7">
				<!-- Center medallion -->
				<circle cx="300" cy="30" r="20" fill="none" stroke="currentColor" stroke-width="2" />
				<path
					d="M 300 15 L 305 25 L 315 25 L 307 32 L 310 42 L 300 36 L 290 42 L 293 32 L 285 25 L 295 25 Z"
				/>

				<!-- Side ornaments -->
				<g opacity="0.5">
					<path d="M 200 20 Q 210 30 200 40 Q 190 30 200 20" />
					<path d="M 400 20 Q 410 30 400 40 Q 390 30 400 20" />

					<path d="M 150 25 Q 155 30 150 35 Q 145 30 150 25" />
					<path d="M 450 25 Q 455 30 450 35 Q 445 30 450 25" />
				</g>

				<!-- Connecting lines -->
				<line
					x1="30"
					y1="30"
					x2="170"
					y2="30"
					stroke="currentColor"
					stroke-width="1.5"
					opacity="0.4"
				/>
				<line
					x1="430"
					y1="30"
					x2="570"
					y2="30"
					stroke="currentColor"
					stroke-width="1.5"
					opacity="0.4"
				/>
			</g>
		</svg>
	{:else}
		<!-- Default yurt-inspired pattern -->
		<svg viewBox="0 0 500 50" xmlns="http://www.w3.org/2000/svg">
			<g fill="currentColor" opacity="0.6">
				<!-- Center yurt symbol -->
				<circle cx="250" cy="25" r="15" fill="none" stroke="currentColor" stroke-width="2" />
				<path d="M 250 12 L 256 20 L 250 25 L 244 20 Z" fill="currentColor" />
				<path d="M 250 25 L 256 30 L 250 38 L 244 30 Z" fill="currentColor" />

				<!-- Side geometric patterns -->
				<g opacity="0.5">
					<!-- Left side -->
					<rect x="180" y="20" width="10" height="10" transform="rotate(45 185 25)" />
					<rect x="130" y="20" width="8" height="8" transform="rotate(45 134 24)" />

					<!-- Right side -->
					<rect x="310" y="20" width="10" height="10" transform="rotate(45 315 25)" />
					<rect x="360" y="20" width="8" height="8" transform="rotate(45 364 24)" />
				</g>

				<!-- Decorative lines -->
				<line
					x1="20"
					y1="25"
					x2="120"
					y2="25"
					stroke="currentColor"
					stroke-width="1.5"
					opacity="0.4"
				/>
				<line
					x1="380"
					y1="25"
					x2="480"
					y2="25"
					stroke="currentColor"
					stroke-width="1.5"
					opacity="0.4"
				/>

				<!-- Small dots -->
				<circle cx="100" cy="25" r="2" />
				<circle cx="400" cy="25" r="2" />
			</g>
		</svg>
	{/if}
</div>

<style>
	.kazakh-divider {
		width: 100%;
		max-width: 500px;
		height: 50px;
		margin: 3rem auto;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #0369a1;
		opacity: 0.8;
	}

	.kazakh-divider.simple {
		max-width: 400px;
		height: 40px;
	}

	.kazakh-divider.ornate {
		max-width: 600px;
		height: 60px;
	}

	.kazakh-divider svg {
		width: 100%;
		height: 100%;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.kazakh-divider {
			margin: 2rem auto;
		}
	}
</style>
