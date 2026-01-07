<script>
	import { currentLanguage } from '$lib/stores/languageStore';
	import { translationStatus } from '$lib/services/aiTranslator';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	const messages = {
		EN: 'This translation will be conducted by AI translator. We apologize if there are some wrong translations and it takes a bit of time.',
		KK: 'Бұл аударма AI аудармашысымен жасалады. Қате аудармалар болуы мүмкін және уақытты қажет ететіндігі үшін кешірім өтінеміз.',
		RU: 'Этот перевод будет выполнен ИИ-переводчиком. Мы приносим извинения, если возникнут ошибки в переводе и процесс займет некоторое время.',
		FR: "Cette traduction sera effectuée par un traducteur IA. Nous nous excusons s'il y a des erreurs de traduction et si cela prend un peu de temps.",
		DE: 'Diese Übersetzung wird von einem KI-Übersetzer durchgeführt. Wir entschuldigen uns für etwaige Fehlübersetzungen und die benötigte Zeit.',
		ES: 'Esta traducción será realizada por un traductor de IA. Pedimos disculpas si hay algunas traducciones incorrectas y si toma un poco de tiempo.',
		ZH: '此翻译将由人工智能翻译器进行。如果出现翻译错误或耗时较长，我们深表歉意。',
		JA: 'この翻訳はAI翻訳機によって行われます。誤訳がある場合や、翻訳に時間がかかる場合がありますが、ご了承ください。',
		AR: 'سيتم إجراء هذه الترجمة بواسطة مترجم ذكاء اصطناعي. نعتذر إذا كانت هناك بعض الترجمات الخاطئة وإذا استغرق الأمر بعض الوقت.'
	};

	let displayedText = '';
	let timeout;
	let index = 0;
	let isVisible = false;

	let hideTimeout;

	$: if ($translationStatus === 'loading') {
		if (hideTimeout) clearTimeout(hideTimeout);
		isVisible = true;
		startTypewriter($currentLanguage);
	} else if ($translationStatus === 'translated' || $translationStatus === 'error') {
		if (hideTimeout) clearTimeout(hideTimeout);
		hideTimeout = setTimeout(() => {
			isVisible = false;
		}, 5000);
	}

	function startTypewriter(lang) {
		const msg = messages[lang] || messages['EN'];
		displayedText = '';
		index = 0;
		if (timeout) clearTimeout(timeout);
		type(msg);
	}

	function type(msg) {
		if (index < msg.length) {
			displayedText = msg.slice(0, index + 1);
			index++;
			timeout = setTimeout(() => type(msg), 25);
		}
	}

	onMount(() => {
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	});
</script>

{#if isVisible}
	<div
		class="disclaimer-wrap notranslate"
		translate="no"
		data-no-ai-translate
		transition:fade={{ duration: 300 }}
	>
		<div class="disclaimer-card">
			<div class="glow-effect"></div>
			<div class="content">
				<div class="ai-badge">
					<span class="ai-pulse"></span>
					AI TRANSLATOR
				</div>
				<p class="text">
					{displayedText}<span class="cursor">_</span>
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.disclaimer-wrap {
		position: absolute;
		top: calc(100% + 12px);
		right: 0;
		width: 300px;
		z-index: 2000;
		pointer-events: none;
	}

	.disclaimer-card {
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(56, 189, 248, 0.3);
		border-radius: 16px;
		padding: 14px 16px;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.3),
			0 10px 10px -5px rgba(0, 0, 0, 0.2),
			inset 0 0 20px rgba(56, 189, 248, 0.05);
		position: relative;
		overflow: hidden;
	}

	.glow-effect {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle at center, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
		opacity: 0.6;
		animation: rotate 15s linear infinite;
	}

	.content {
		position: relative;
		z-index: 1;
	}

	.ai-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(56, 189, 248, 0.2);
		color: #7dd3fc;
		font-size: 0.65rem;
		font-weight: 800;
		padding: 4px 10px;
		border-radius: 6px;
		margin-bottom: 10px;
		letter-spacing: 0.06em;
		border: 1px solid rgba(56, 189, 248, 0.3);
		text-transform: uppercase;
	}

	.ai-pulse {
		width: 6px;
		height: 6px;
		background: #7dd3fc;
		border-radius: 50%;
		position: relative;
	}

	.ai-pulse::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: inherit;
		border-radius: inherit;
		animation: pulse 2s infinite;
	}

	.text {
		color: #f1f5f9;
		font-size: 0.85rem;
		line-height: 1.55;
		margin: 0;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
		font-weight: 450;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.cursor {
		color: #38bdf8;
		font-weight: bold;
		animation: blink 0.8s infinite;
		margin-left: 2px;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 0.8;
		}
		100% {
			transform: scale(3.5);
			opacity: 0;
		}
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 600px) {
		.disclaimer-wrap {
			width: 250px;
			right: -40px;
		}
		.text {
			font-size: 0.8rem;
		}
	}
</style>
