<script>
	import { currentLanguage } from '$lib/stores/languageStore';
	import { translationStatus } from '$lib/services/aiTranslator';
 	import { fade } from 'svelte/transition';

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
 	let isVisible = false;

 	let hideTimeout;

 	$: if ($translationStatus === 'loading') {
 		// Clear any existing hide timeout
 		if (hideTimeout) {
 			clearTimeout(hideTimeout);
 			hideTimeout = null;
 		}
 		// Show the message
 		isVisible = true;
 		// Display full message immediately instead of typewriter effect
 		displayedText = messages[$currentLanguage] || messages['EN'];
 		// Force hide after 7 seconds
 		hideTimeout = setTimeout(() => {
 			isVisible = false;
 		}, 7000);
 	} else if ($translationStatus === 'translated' || $translationStatus === 'error') {
 		// Hide immediately or after short delay when translation completes
 		if (hideTimeout) clearTimeout(hideTimeout);
 		hideTimeout = setTimeout(() => {
 			isVisible = false;
 		}, 500); // Quick hide when translation done
 	}


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
 					{displayedText}
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
    left: 0;
    margin: 0 auto;
    width: auto;
    max-width: calc(100vw - 32px);
    min-width: 250px;
    z-index: 2000;
    pointer-events: none;
    overflow: visible !important;
    text-overflow: initial !important;
    display: block !important;
    visibility: visible !important;
}

.disclaimer-card {
    background: #0f172a;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    position: relative;
}

	.glow-effect {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
		opacity: 0.4;
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
		background: rgba(255, 255, 255, 0.15);
		color: #ffffff;
		font-size: 0.65rem;
		font-weight: 800;
		padding: 4px 10px;
		border-radius: 6px;
		margin-bottom: 10px;
		letter-spacing: 0.06em;
		border: 1px solid rgba(255, 255, 255, 0.3);
		text-transform: uppercase;
	}

	.ai-pulse {
		width: 6px;
		height: 6px;
		background: #ffffff;
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
    color: #ffffff;
    font-size: 0.85rem;
    line-height: 1.55;
    margin: 0;
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;
    font-weight: 450;
    overflow: visible !important;
    text-overflow: initial !important;
    white-space: normal !important;
    word-wrap: break-word !important;
    display: block !important;
    visibility: visible !important;
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
			position: fixed;
			top: 3.5rem;
			left: 50%;
			transform: translateX(-50%);
			width: min(200px, calc(100vw - 2rem));
			max-width: calc(100vw - 2rem);
			z-index: 9999;
			box-sizing: border-box;
		}
		.disclaimer-card {
			padding: 8px 10px;
		}
		.text {
			font-size: 0.75rem;
			word-wrap: break-word;
		}
		.ai-badge {
			font-size: 0.7rem;
		}
		.ai-badge {
			font-size: 0.6rem;
			padding: 3px 8px;
		}
	}
</style>
