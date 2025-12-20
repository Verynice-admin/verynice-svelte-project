<script lang="ts">
	import Button from '$components/ui/Button.svelte';
	import Card from '$components/ui/Card.svelte';
	import Input from '$components/ui/Input.svelte';
	import LazyImage from '$components/ui/LazyImage.svelte';

	let email = '';
	let password = '';
	let emailError = '';
	let loading = false;

	function handleSubmit() {
		loading = true;
		setTimeout(() => {
			loading = false;
			alert('Demo submission!');
		}, 2000);
	}
</script>

<svelte:head>
	<title>Component Demo - VeryNice</title>
</svelte:head>

<div class="demo-page">
	<div class="container">
		<header class="demo-header">
			<h1>UI Components Demo</h1>
			<p>Showcase of atomic UI components built for VeryNice</p>
		</header>

		<!-- Buttons Section -->
		<section class="demo-section">
			<h2>Buttons</h2>
			<Card>
				<div class="demo-grid">
					<div>
						<h3>Variants</h3>
						<div class="button-group">
							<Button variant="primary">Primary</Button>
							<Button variant="secondary">Secondary</Button>
							<Button variant="ghost">Ghost</Button>
							<Button variant="danger">Danger</Button>
						</div>
					</div>

					<div>
						<h3>Sizes</h3>
						<div class="button-group">
							<Button size="sm">Small</Button>
							<Button size="md">Medium</Button>
							<Button size="lg">Large</Button>
						</div>
					</div>

					<div>
						<h3>States</h3>
						<div class="button-group">
							<Button disabled>Disabled</Button>
							<Button loading>Loading</Button>
							<Button href="#demo">Link Button</Button>
						</div>
					</div>
				</div>
			</Card>
		</section>

		<!-- Cards Section -->
		<section class="demo-section">
			<h2>Cards</h2>
			<div class="card-grid">
				<Card>
					<span slot="header">Standard Card</span>
					This is a standard card component with a header slot.
				</Card>

				<Card glass={true}>
					<span slot="header">Glass Card</span>
					This card uses glassmorphism effect for a modern look.
				</Card>

				<Card hover={true}>
					<span slot="header">Hover Card</span>
					Hover over this card to see the animation effect.
					<div slot="footer">
						<Button size="sm" variant="ghost">Learn More</Button>
					</div>
				</Card>
			</div>
		</section>

		<!-- Inputs Section -->
		<section class="demo-section">
			<h2>Form Inputs</h2>
			<Card>
				<form on:submit|preventDefault={handleSubmit}>
					<div class="form-demo">
						<Input
							label="Email Address"
							type="email"
							placeholder="you@example.com"
							bind:value={email}
							error={emailError}
							required={true}
						/>

						<Input
							label="Password"
							type="password"
							placeholder="Enter your password"
							bind:value={password}
							required={true}
						/>

						<Input
							label="Disabled Input"
							type="text"
							value="This input is disabled"
							disabled={true}
						/>

						<div class="form-actions">
							<Button type="submit" {loading}>Submit Form</Button>
							<Button variant="secondary" type="button">Cancel</Button>
						</div>
					</div>
				</form>
			</Card>
		</section>

		<!-- Lazy Image Section -->
		<section class="demo-section">
			<h2>Lazy Loading Images</h2>
			<Card>
				<p style="margin-bottom: 1rem;">
					Scroll down to see lazy loading with blur placeholders in action.
				</p>
				<div class="image-demo">
					<LazyImage
						src="https://res.cloudinary.com/demo/image/upload/sample.jpg"
						alt="Sample landscape"
						width={800}
						height={600}
					/>
				</div>
			</Card>
		</section>
	</div>
</div>

<style>
	.demo-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		padding: 2rem 1rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.demo-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #e2e8f0;
		margin-bottom: 0.5rem;
	}

	.demo-header p {
		font-size: 1.125rem;
		color: #94a3b8;
	}

	.demo-section {
		margin-bottom: 3rem;
	}

	.demo-section h2 {
		font-size: 1.875rem;
		font-weight: 600;
		color: #e2e8f0;
		margin-bottom: 1.5rem;
	}

	.demo-section h3 {
		font-size: 1.125rem;
		font-weight: 500;
		color: #cbd5e1;
		margin-bottom: 1rem;
	}

	.demo-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.card-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}

	.form-demo {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 500px;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		padding-top: 1rem;
	}

	.image-demo {
		max-width: 800px;
		margin: 0 auto;
	}

	@media (max-width: 768px) {
		.demo-header h1 {
			font-size: 2rem;
		}

		.demo-section h2 {
			font-size: 1.5rem;
		}
	}
</style>
