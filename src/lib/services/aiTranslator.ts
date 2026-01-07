import { browser } from '$app/environment';
import { writable, type Writable, get } from 'svelte/store';

type SegmentPayload = { id: string; text: string };

interface NodeEntry {
	node: Text;
	normalized: string;
	leading: string;
	trailing: string;
	segmentId?: string;
}

export type TranslationStatus = 'idle' | 'loading' | 'translated' | 'error' | 'original';
export const translationStatus: Writable<TranslationStatus> = writable('idle');

const LANGUAGE_LABELS: Record<string, string> = {
	EN: 'English',
	KK: 'Kazakh',
	RU: 'Russian',
	FR: 'French',
	DE: 'German',
	ES: 'Spanish',
	ZH: 'Chinese',
	JA: 'Japanese',
	AR: 'Arabic'
};

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CANVAS', 'SVG']);
const MAX_SEGMENTS_PER_REQUEST = 125;
const MIN_TEXT_LENGTH = 1;
const MAX_TEXT_LENGTH = 3000;

const translationCache = new Map<string, Map<string, string>>();
const originalTextCache = new Map<Text, string>();
let requestCounter = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getLanguageName = (code: string) => LANGUAGE_LABELS[code] ?? code;

const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim();

const shouldSkipElement = (element: Element | null) => {
	if (!element) return true;
	if (SKIP_TAGS.has(element.tagName)) return true;
	if (element.closest('[data-no-ai-translate]') || element.closest('.notranslate')) return true;
	if (element.closest('[translate="no"]')) return true;
	return false;
};

const collectSegments = () => {
	const entries: NodeEntry[] = [];
	const segments: SegmentPayload[] = [];
	const uniqueMap = new Map<string, string>();

	if (!document.body) {
		return { nodes: entries, segments };
	}

	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	let current: Node | null = walker.nextNode();

	while (current) {
		const textNode = current as Text;
		const parent = textNode.parentElement;

		if (!shouldSkipElement(parent)) {
			const value = textNode.nodeValue ?? '';
			const normalized = normalizeText(value);

			if (
				normalized &&
				normalized.length >= MIN_TEXT_LENGTH &&
				normalized.length <= MAX_TEXT_LENGTH
			) {
				const leading = value.match(/^\s*/)?.[0] ?? '';
				const trailing = value.match(/\s*$/)?.[0] ?? '';

				let id = uniqueMap.get(normalized);
				if (!id) {
					id = `seg-${uniqueMap.size}`;
					uniqueMap.set(normalized, id);
					segments.push({ id, text: normalized });
				}

				entries.push({
					node: textNode,
					normalized,
					leading,
					trailing,
					segmentId: id
				});
			}
		}
		current = walker.nextNode();
	}

	// --- Attribute Segments ---
	const attrElements = document.querySelectorAll<HTMLElement>(
		'[placeholder], [title]:not(title), [aria-label]'
	);

	attrElements.forEach((el) => {
		if (shouldSkipElement(el)) return;

		(['placeholder', 'title', 'aria-label'] as const).forEach((attrName) => {
			const value = el.getAttribute(attrName);
			if (!value) return;

			const normalized = normalizeText(value);
			if (!normalized || normalized.length < MIN_TEXT_LENGTH) return;

			let id = uniqueMap.get(normalized);
			if (!id) {
				id = `seg-${uniqueMap.size}`;
				uniqueMap.set(normalized, id);
				segments.push({ id, text: normalized });
			}

			el.setAttribute(`data-trans-id-${attrName}`, id);
			if (!el.hasAttribute(`data-orig-${attrName}`)) {
				el.setAttribute(`data-orig-${attrName}`, value);
			}
		});
	});

	// --- Title Segment ---
	if (document.title) {
		const normTitle = normalizeText(document.title);
		if (!uniqueMap.has(normTitle)) {
			segments.push({ id: `seg-${uniqueMap.size}`, text: normTitle });
			uniqueMap.set(normTitle, `seg-${uniqueMap.size}`);
		}
	}

	return { nodes: entries, segments };
};

const ensureLanguageCache = (languageCode: string) => {
	let cache = translationCache.get(languageCode);
	if (!cache) {
		cache = new Map<string, string>();
		translationCache.set(languageCode, cache);
	}
	return cache;
};

const requestTranslations = async (
	languageCode: string,
	segments: SegmentPayload[],
	onBatchSuccess?: (cache: Map<string, string>) => void
) => {
	const languageCache = ensureLanguageCache(languageCode);
	const missing = segments.filter((segment) => !languageCache.has(segment.text));

	if (!missing.length) {
		if (onBatchSuccess) onBatchSuccess(languageCache);
		return languageCache;
	}

	const targetLanguage = getLanguageName(languageCode);

	for (let i = 0; i < missing.length; i += MAX_SEGMENTS_PER_REQUEST) {
		const batch = missing.slice(i, i + MAX_SEGMENTS_PER_REQUEST);
		const idToText = new Map(batch.map((segment) => [segment.id, segment.text]));
		const batchNum = i / MAX_SEGMENTS_PER_REQUEST + 1;

		if (i > 0) await sleep(300); // Respect rate limits

		try {
			const response = await fetch('/api/translate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetLanguage, segments: batch })
			});

			if (!response.ok) {
				console.error(`[Translation] Batch ${batchNum} failed:`, response.statusText);
				continue;
			}

			const data = await response.json();
			const translations: { id: string; translated: string }[] = Array.isArray(data?.translations)
				? data.translations
				: [];

			translations.forEach((item) => {
				const text = idToText.get(item.id);
				if (text && item.translated) {
					languageCache.set(text, item.translated);
				}
			});

			if (onBatchSuccess) {
				onBatchSuccess(languageCache);
			}
		} catch (batchError) {
			console.error(`[Translation] Critical error in batch ${batchNum}:`, batchError);
		}
	}

	return languageCache;
};

const restoreOriginalText = () => {
	for (const [node, value] of originalTextCache.entries()) {
		if (node.isConnected) {
			node.textContent = value;
		}
	}
	originalTextCache.clear();

	const attrElements = document.querySelectorAll<HTMLElement>(
		'[data-orig-placeholder], [data-orig-title], [data-orig-aria-label]'
	);
	attrElements.forEach((el) => {
		(['placeholder', 'title', 'aria-label'] as const).forEach((attr) => {
			const val = el.getAttribute(`data-orig-${attr}`);
			if (val !== null) el.setAttribute(attr, val);
		});
	});

	if (document.documentElement.dataset.origTitle) {
		document.title = document.documentElement.dataset.origTitle;
	}
};

const applyTranslationsToNodes = (
	nodes: NodeEntry[],
	languageCache: Map<string, string>
) => {
	nodes.forEach((entry) => {
		if (!entry.segmentId) return;

		const translated = languageCache.get(entry.normalized);
		if (!translated) return;

		if (!originalTextCache.has(entry.node)) {
			originalTextCache.set(entry.node, entry.node.textContent ?? '');
		}

		entry.node.textContent = `${entry.leading}${translated}${entry.trailing}`;
	});

	const attrElements = document.querySelectorAll<HTMLElement>(
		'[data-orig-placeholder], [data-orig-title], [data-orig-aria-label]'
	);
	attrElements.forEach((el) => {
		(['placeholder', 'title', 'aria-label'] as const).forEach((attr) => {
			const origValue = el.getAttribute(`data-orig-${attr}`);
			if (!origValue) return;

			const normalized = normalizeText(origValue);
			const translated = languageCache.get(normalized);
			if (translated) {
				el.setAttribute(attr, translated);
			}
		});
	});

	if (document.title) {
		const normTitle = normalizeText(document.title);
		const translated = languageCache.get(normTitle);
		if (translated) {
			if (!document.documentElement.dataset.origTitle) {
				document.documentElement.dataset.origTitle = document.title;
			}
			document.title = translated;
		}
	}
};

let observer: MutationObserver | null = null;

const handleMutations = (mutations: MutationRecord[]) => {
	const currentLang = document.documentElement.dataset.translationLanguage;
	if (!currentLang || currentLang === 'EN' || get(translationStatus) === 'loading') return;

	let needsTranslation = false;
	mutations.forEach((mutation) => {
		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const el = node as HTMLElement;
					if (!shouldSkipElement(el) && !el.closest('[data-no-ai-translate]')) {
						needsTranslation = true;
					}
				} else if (node.nodeType === Node.TEXT_NODE) {
					needsTranslation = true;
				}
			});
		} else if (mutation.type === 'characterData') {
			const target = mutation.target.parentElement;
			if (!shouldSkipElement(target)) {
				needsTranslation = true;
			}
		}
	});

	if (needsTranslation) {
		clearTimeout((window as any).__translationDebounce);
		(window as any).__translationDebounce = setTimeout(() => {
			translatePageTo(currentLang, false);
		}, 500); // More responsive debounce
	}
};

export const startTranslationObserver = () => {
	if (!browser || observer) return;
	observer = new MutationObserver(handleMutations);
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		characterData: true
	});
};

export const stopTranslationObserver = () => {
	if (observer) {
		observer.disconnect();
		observer = null;
	}
};

export const translatePageTo = async (languageCode: string, showLoading = true): Promise<boolean> => {
	if (!browser) return true;

	requestCounter += 1;
	const requestId = requestCounter;
	const root = document.documentElement;

	if (languageCode === 'EN') {
		try {
			stopTranslationObserver();
			restoreOriginalText();
			translationStatus.set('original');
			root.dataset.translationState = 'original';
			root.dataset.translationLanguage = 'EN';
			root.lang = 'en';
			return true;
		} catch (error) {
			console.error('[Translation] Failed to restore original text', error);
			translationStatus.set('error');
			root.dataset.translationState = 'error';
			return false;
		}
	}

	root.lang = languageCode.toLowerCase();

	try {
		if (showLoading) {
			translationStatus.set('loading');
			root.dataset.translationState = 'loading';
		}
		root.dataset.translationLanguage = languageCode;

		if (showLoading) await sleep(50);

		// Always collect fresh segments to catch new content
		const { nodes, segments } = collectSegments();

		if (!nodes.length && !segments.length) {
			if (showLoading) {
				translationStatus.set('translated');
				root.dataset.translationState = 'translated';
			}
			return true;
		}

		// Use the incremental update callback
		await requestTranslations(languageCode, segments, (cache) => {
			// Only apply if this is still the active request
			if (requestId === requestCounter) {
				applyTranslationsToNodes(nodes, cache);
			}
		});

		if (requestId !== requestCounter) {
			return true;
		}

		if (showLoading) {
			translationStatus.set('translated');
			root.dataset.translationState = 'translated';
		}

		// Start observing for future changes
		startTranslationObserver();

		return true;
	} catch (error) {
		console.error('[Translation] Failed to translate page', error);
		if (showLoading) {
			translationStatus.set('error');
			root.dataset.translationState = 'error';
		}
		return false;
	}
};

