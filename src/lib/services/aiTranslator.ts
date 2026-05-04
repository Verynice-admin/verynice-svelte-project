import { browser } from '$app/environment';
import { writable, type Writable, get } from 'svelte/store';

// ============================================================================
// TYPES
// ============================================================================

type SegmentPayload = {
	id: string;
	text: string;
	context?: string;
	parentTag?: string;
};

interface NodeEntry {
	node: Text;
	normalized: string;
	leading: string;
	trailing: string;
	segmentId?: string;
	context?: string;
	parentTag?: string;
}

interface TranslateRequest {
	targetLanguage: string;
	segments: SegmentPayload[];
	context?: string;
}

interface TranslateResponse {
	translations: Array<{ id: string; translated: string }>;
}

export type TranslationStatus = 'idle' | 'loading' | 'translated' | 'error' | 'original';
export const translationStatus: Writable<TranslationStatus> = writable('idle');

// ============================================================================
// CONSTANTS - Match spec exactly
// ============================================================================

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

// PHASE 1: Chunking parameters
const MIN_SEGMENTS_PER_CHUNK = 25;
const MAX_SEGMENTS_PER_CHUNK = 40;
const MAX_TOKENS_PER_CHUNK = 1500;

// PHASE 2: Dynamic content parameters
const DYNAMIC_CONTENT_DEBOUNCE_MS = 600;

// PHASE 4: Retry and cache
const MAX_RETRIES = 1;
const FONT_AGENT_RETRY_DELAY_MS = 300;

// Skip tags - never translate code blocks
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CANVAS', 'SVG', 'CODE', 'PRE']);

// LocalStorage cache key
const LOCAL_STORAGE_KEY = 'vn_translations_';

// ============================================================================
// STATE
// ============================================================================

const translationCache = new Map<string, Map<string, string>>();
const originalTextCache = new Map<Text, string>();
const glossary = new Map<string, string>(); // PHASE 3: Session glossary for consistency
let requestCounter = 0;
let currentLanguage = 'EN';
let observer: MutationObserver | null = null;
let mutationQueue: Set<Node | Element> = new Set();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let fontAgentReady = true;

// ============================================================================
// LOCAL STORAGE CACHE (PHASE 4)
// ============================================================================

const loadFromLocalStorage = (languageCode: string): Map<string, string> | null => {
	if (!browser) return null;
	try {
		const key = LOCAL_STORAGE_KEY + languageCode;
		const stored = localStorage.getItem(key);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && typeof parsed === 'object') {
				const cache = new Map<string, string>(Object.entries(parsed) as [string, string][]);
				console.log('[Translation] Loaded', cache.size, 'cached translations from localStorage');
				return cache;
			}
		}
	} catch (e) {
		console.warn('[Translation] Failed to load from localStorage:', e);
	}
	return null;
};

const saveToLocalStorage = (languageCode: string, cache: Map<string, string>) => {
	if (!browser) return;
	try {
		const key = LOCAL_STORAGE_KEY + languageCode;
		const obj = Object.fromEntries(cache);
		localStorage.setItem(key, JSON.stringify(obj));
	} catch (e) {
		console.warn('[Translation] Failed to save to localStorage:', e);
	}
};

const getCacheKey = (languageCode: string, text: string): string => {
	const hash = simpleHash(text);
	return `${languageCode}:${hash}`;
};

const simpleHash = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return hash.toString(36);
};

// ============================================================================
// UTILITIES
// ============================================================================

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getLanguageName = (code: string): string => LANGUAGE_LABELS[code] ?? code;

const normalizeText = (text: string): string => text.replace(/\s+/g, ' ').trim();

// PHASE 3: Check if should skip translation
const shouldSkipElement = (element: Element | null): boolean => {
	if (!element) return true;
	if (SKIP_TAGS.has(element.tagName)) return true;
	if (element.closest('[data-no-ai-translate]') || element.closest('.notranslate')) return true;
	if (element.closest('[translate="no"]')) return true;
	return false;
};

// PHASE 3: Check if content should NOT be translated (proper nouns, emails, etc.)
const shouldNotTranslateText = (text: string): boolean => {
	// Email addresses
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true;
	// Phone numbers (basic pattern)
	if (/^[\d\s\-\+\(\)]{7,20}$/.test(text)) return true;
	// URLs
	if (/^https?:\/\/[^\s]+$/.test(text)) return true;
	// Currency values (e.g., $100, €50, 100USD)
	if (/^[\$\€\£\¥]?\d+([\.,]\d{2})?\s*([A-Z]{3})?$/.test(text)) return true;
	// Pure numbers
	if (/^\d+([\.,]\d+)?$/.test(text)) return true;
	return false;
};

// PHASE 3: Extract parent context for better translation quality
const getParentContext = (node: Text): string => {
	const parent = node.parentElement;
	if (!parent) return '';
	
	const parentText = parent.textContent || '';
	const tagName = parent.tagName.toLowerCase();
	
	// Get grandparent context if parent is generic container
	let context = parentText.slice(0, 200);
	
	return context;
};

// ============================================================================
// PHASE 1: COLLECT ALL TEXT NODES FROM FULL DOM
// ============================================================================

const collectAllTextNodes = (): { nodes: NodeEntry[]; segments: SegmentPayload[] } => {
	const entries: NodeEntry[] = [];
	const segments: SegmentPayload[] = [];
	const uniqueMap = new Map<string, string>();

	if (!document.body) {
		return { nodes: entries, segments };
	}

	// Walk entire DOM tree including hidden elements
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	let current: Node | null = walker.nextNode();

	while (current) {
		const textNode = current as Text;
		const parent = textNode.parentElement;

		// PHASE 1: Skip if already translated or should skip
		if (shouldSkipElement(parent)) {
			current = walker.nextNode();
			continue;
		}

		// PHASE 3: Check if already marked as translated
		if (parent?.hasAttribute('data-translated')) {
			current = walker.nextNode();
			continue;
		}

		const value = textNode.nodeValue ?? '';
		const normalized = normalizeText(value);

		// Skip empty or very short text
		if (!normalized || normalized.length < 2) {
			current = walker.nextNode();
			continue;
		}

		// PHASE 3: Don't translate certain patterns
		if (shouldNotTranslateText(normalized)) {
			current = walker.nextNode();
			continue;
		}

		// Get context for translation quality
		const context = getParentContext(textNode);
		const parentTag = parent?.tagName.toLowerCase() || '';

		const leading = value.match(/^\s*/)?.[0] ?? '';
		const trailing = value.match(/\s*$/)?.[0] ?? '';

		// Deduplicate segments
		let id = uniqueMap.get(normalized);
		if (!id) {
			id = `seg-${uniqueMap.size}`;
			uniqueMap.set(normalized, id);
			segments.push({ id, text: normalized, context, parentTag });
		}

		entries.push({
			node: textNode,
			normalized,
			leading,
			trailing,
			segmentId: id,
			context,
			parentTag
		});

		current = walker.nextNode();
	}

	// Collect attribute content (placeholders, aria-labels, alt text, etc.)
	const attrElements = document.querySelectorAll<HTMLElement>(
		'[placeholder],[title]:not(title),[aria-label],[alt],[aria-description],[aria-placeholder],[aria-valuetext],[aria-roledescription]'
	);

	attrElements.forEach((el) => {
		if (shouldSkipElement(el)) return;
		if (el.hasAttribute('data-translated')) return;

		const attributes = ['placeholder', 'title', 'aria-label', 'alt', 'aria-description', 'aria-placeholder', 'aria-valuetext', 'aria-roledescription'] as const;

		attributes.forEach((attrName) => {
			const value = el.getAttribute(attrName);
			if (!value) return;

			const normalized = normalizeText(value);
			if (!normalized || normalized.length < 2) return;
			if (shouldNotTranslateText(normalized)) return;

			let id = uniqueMap.get(normalized);
			if (!id) {
				id = `seg-${uniqueMap.size}`;
				uniqueMap.set(normalized, id);
				segments.push({ id, text: normalized, context: el.textContent || '', parentTag: el.tagName.toLowerCase() });
			}

			el.setAttribute(`data-trans-id-${attrName}`, id);
			if (!el.hasAttribute(`data-orig-${attrName}`)) {
				el.setAttribute(`data-orig-${attrName}`, value);
			}
		});
	});

	// Title tag
	if (document.title) {
		const normTitle = normalizeText(document.title);
		if (!uniqueMap.has(normTitle)) {
			segments.push({ id: `title-${uniqueMap.size}`, text: normTitle, context: 'Page title', parentTag: 'title' });
		}
	}

	return { nodes: entries, segments };
};

// ============================================================================
// PHASE 1: CHUNKING - Group segments into batches of 25-40, respecting sentence boundaries
// ============================================================================

const createChunks = (segments: SegmentPayload[]): SegmentPayload[][] => {
	const chunks: SegmentPayload[][] = [];
	let currentChunk: SegmentPayload[] = [];
	let currentTokens = 0;

	for (const segment of segments) {
		// Estimate tokens (rough approximation: 1 token ≈ 4 chars)
		const segmentTokens = Math.ceil(segment.text.length / 4);
		
		// Check if adding this segment would exceed limits
		const wouldExceedSegments = currentChunk.length >= MAX_SEGMENTS_PER_CHUNK;
		const wouldExceedTokens = currentTokens + segmentTokens > MAX_TOKENS_PER_CHUNK;

		// Start new chunk if current is full
		if (wouldExceedSegments || (currentChunk.length >= MIN_SEGMENTS_PER_CHUNK && wouldExceedTokens)) {
			if (currentChunk.length > 0) {
				chunks.push(currentChunk);
			}
			currentChunk = [segment];
			currentTokens = segmentTokens;
		} else {
			currentChunk.push(segment);
			currentTokens += segmentTokens;
		}
	}

	// Add remaining segments
	if (currentChunk.length > 0) {
		chunks.push(currentChunk);
	}

	console.log(`[Translation] Created ${chunks.length} chunks from ${segments.length} segments`);
	return chunks;
};

// ============================================================================
// PHASE 3 & 4: TRANSLATION API WITH RETRY AND CACHE
// ============================================================================

const ensureLanguageCache = (languageCode: string): Map<string, string> => {
	let cache = translationCache.get(languageCode);
	if (!cache) {
		const stored = loadFromLocalStorage(languageCode);
		cache = stored || new Map<string, string>();
		translationCache.set(languageCode, cache);
	}
	return cache;
};

const translateChunk = async (
	chunk: SegmentPayload[],
	languageCode: string,
	retryCount = 0
): Promise<Map<string, string>> => {
	const languageCache = ensureLanguageCache(languageCode);
	const missing = chunk.filter((segment) => !languageCache.has(segment.text));

	if (!missing.length) {
		return languageCache;
	}

	const targetLanguage = getLanguageName(languageCode);

	console.log(`[Translation] Sending ${missing.length} segments to API for ${targetLanguage}`);

	try {
		const response = await fetch('/api/translate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				targetLanguage,
				segments: missing.map(s => ({ id: s.id, text: s.text }))
			} as TranslateRequest)
		});

		if (!response.ok) {
			throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
		}

		const data: TranslateResponse = await response.json();
		const translations = Array.isArray(data?.translations) ? data.translations : [];

		console.log(`[Translation] Received ${translations.length} translations back`);

		translations.forEach((item) => {
			if (item.id && item.translated) {
				// Find the original text for this segment ID
				const original = missing.find(s => s.id === item.id);
				if (original) {
					// CRITICAL: Store by original text, not by ID
					languageCache.set(original.text, item.translated);
					// PHASE 3: Add to glossary for consistency
					glossary.set(original.text, item.translated);
				}
			}
		});

		// Save to localStorage
		saveToLocalStorage(languageCode, languageCache);

		return languageCache;
	} catch (error) {
		console.error(`[Translation] Chunk failed (retry ${retryCount}):`, error);
		
		// PHASE 4: Retry logic
		if (retryCount < MAX_RETRIES) {
			await sleep(500 * (retryCount + 1));
			return translateChunk(chunk, languageCode, retryCount + 1);
		}
		
		// Skip failed chunk but log
		console.warn(`[Translation] Skipping failed chunk after ${MAX_RETRIES} retries`);
		return languageCache;
	}
};

// ============================================================================
// PHASE 1: APPLY TRANSLATIONS TO DOM
// ============================================================================

const applyTranslationsToNodes = (
	nodes: NodeEntry[],
	languageCache: Map<string, string>
): Set<Node> => {
	const translatedNodes = new Set<Node>();

	nodes.forEach((entry) => {
		if (!entry.segmentId) return;

		const translated = languageCache.get(entry.normalized);
		if (!translated) return;

		// Store original text if not already stored
		if (!originalTextCache.has(entry.node)) {
			originalTextCache.set(entry.node, entry.node.textContent ?? '');
		}

		// Apply translation
		entry.node.textContent = `${entry.leading}${translated}${entry.trailing}`;

		// PHASE 1: Mark node as translated to prevent re-translation
		const parent = entry.node.parentElement;
		if (parent) {
			parent.setAttribute('data-translated', 'true');
		}

		translatedNodes.add(entry.node);
	});

	// Handle attribute translations
	const attrElements = document.querySelectorAll<HTMLElement>(
		'[data-orig-placeholder], [data-orig-title], [data-orig-aria-label], [data-orig-alt], [data-orig-aria-description], [data-orig-aria-placeholder], [data-orig-aria-valuetext], [data-orig-aria-roledescription]'
	);

	attrElements.forEach((el) => {
		const attrs = ['placeholder', 'title', 'aria-label', 'alt', 'aria-description', 'aria-placeholder', 'aria-valuetext', 'aria-roledescription'] as const;
		
		attrs.forEach((attr) => {
			const origValue = el.getAttribute(`data-orig-${attr}`);
			if (!origValue) return;

			const normalized = normalizeText(origValue);
			const translated = languageCache.get(normalized);
			
			if (translated) {
				el.setAttribute(attr, translated);
				el.setAttribute('data-translated', 'true');
				translatedNodes.add(el);
			}
		});
	});

	// Handle title tag
	if (document.title) {
		const normTitle = normalizeText(document.title);
		const translated = languageCache.get(normTitle);
		if (translated) {
			if (!document.documentElement.dataset.origTitle) {
				document.documentElement.dataset.origTitle = document.title;
			}
			document.title = translated;
			document.documentElement.setAttribute('data-translated', 'true');
		}
	}

	return translatedNodes;
};

// ============================================================================
// PHASE 3: DISPATCH FONT CHECK EVENT (if needed)
// ============================================================================

const checkAndDispatchFontEvent = (nodes: Set<Node>) => {
	// Check if any translated content might need font verification
	// This is a signal to the Font Agent to check glyph coverage
	nodes.forEach((node) => {
		const parent = node.parentElement;
		if (!parent) return;

		// Simple heuristic: if text contains non-ASCII characters, might need font check
		const text = node.textContent || '';
		const hasNonAscii = /[^\x00-\x7F]/.test(text);
		
		if (hasNonAscii) {
			parent.dispatchEvent(new CustomEvent('fontCheckRequired', {
				bubbles: true,
				detail: { node: parent, text }
			}));
		}
	});
};

// ============================================================================
// PHASE 2: MUTATION OBSERVER FOR DYNAMIC CONTENT
// ============================================================================

const handleMutations = (mutations: MutationRecord[]) => {
	const currentLang = document.documentElement.dataset.translationLanguage;
	if (!currentLang || currentLang === 'EN') return;
	if (get(translationStatus) === 'loading') return;

	let needsTranslation = false;

	mutations.forEach((mutation) => {
		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const el = node as HTMLElement;
					// Check if already translated
					if (!el.hasAttribute('data-translated') && !shouldSkipElement(el)) {
						mutationQueue.add(el);
						needsTranslation = true;
					}
				} else if (node.nodeType === Node.TEXT_NODE) {
					const parent = (node as Text).parentElement;
					if (parent && !parent.hasAttribute('data-translated') && !shouldSkipElement(parent)) {
						mutationQueue.add(node);
						needsTranslation = true;
					}
				}
			});
		} else if (mutation.type === 'characterData') {
			const target = mutation.target.parentElement;
			if (target && !target.hasAttribute('data-translated') && !shouldSkipElement(target)) {
				mutationQueue.add(mutation.target);
				needsTranslation = true;
			}
		}
	});

	// PHASE 2: 600ms debounce
	if (needsTranslation && !debounceTimer) {
		debounceTimer = setTimeout(() => {
			processMutationQueue();
			debounceTimer = null;
		}, DYNAMIC_CONTENT_DEBOUNCE_MS);
	}
};

const processMutationQueue = async () => {
	if (mutationQueue.size === 0) return;

	const currentLang = document.documentElement.dataset.translationLanguage;
	if (!currentLang || currentLang === 'EN') return;

	// Wait for Font Agent to be ready (PHASE 4)
	if (!fontAgentReady) {
		await sleep(FONT_AGENT_RETRY_DELAY_MS);
	}

	// Collect nodes from queue and translate
	const { nodes, segments } = collectFromQueue();
	
	if (segments.length === 0) {
		mutationQueue.clear();
		return;
	}

	// Create chunks and translate in parallel
	const chunks = createChunks(segments);
	const translatedNodeSets: Set<Node>[] = [];

	// PHASE 1: Process chunks in parallel using Promise.all
	await Promise.all(
		chunks.map(async (chunk) => {
			const cache = await translateChunk(chunk, currentLang);
			const translatedNodes = applyTranslationsToNodes(
				nodes.filter(n => chunk.some(s => s.id === n.segmentId)),
				cache
			);
			translatedNodeSets.push(translatedNodes);
		})
	);

	// PHASE 2: Dispatch translationChunkDone event for Font Agent
	const allTranslatedNodes = new Set<Node>();
	translatedNodeSets.forEach(set => set.forEach(n => allTranslatedNodes.add(n)));

	if (allTranslatedNodes.size > 0) {
		document.body.dispatchEvent(new CustomEvent('translationChunkDone', {
			bubbles: true,
			detail: { nodes: Array.from(allTranslatedNodes) }
		}));
		
		// PHASE 3: Check font coverage
		checkAndDispatchFontEvent(allTranslatedNodes);
	}

	mutationQueue.clear();
};

const collectFromQueue = (): { nodes: NodeEntry[]; segments: SegmentPayload[] } => {
	const entries: NodeEntry[] = [];
	const segments: SegmentPayload[] = [];
	const uniqueMap = new Map<string, string>();

	mutationQueue.forEach((nodeOrElement) => {
		if (nodeOrElement.nodeType === Node.TEXT_NODE) {
			const textNode = nodeOrElement as Text;
			const parent = textNode.parentElement;
			
			if (!parent || shouldSkipElement(parent) || parent.hasAttribute('data-translated')) return;

			const value = textNode.nodeValue ?? '';
			const normalized = normalizeText(value);
			
			if (!normalized || normalized.length < 2 || shouldNotTranslateText(normalized)) return;

			const context = getParentContext(textNode);
			const parentTag = parent.tagName.toLowerCase();

			let id = uniqueMap.get(normalized);
			if (!id) {
				id = `seg-${uniqueMap.size}`;
				uniqueMap.set(normalized, id);
				segments.push({ id, text: normalized, context, parentTag });
			}

			entries.push({
				node: textNode,
				normalized,
				leading: value.match(/^\s*/)?.[0] ?? '',
				trailing: value.match(/\s*$/)?.[0] ?? '',
				segmentId: id,
				context,
				parentTag
			});
		} else if (nodeOrElement.nodeType === Node.ELEMENT_NODE) {
			const el = nodeOrElement as HTMLElement;
			if (shouldSkipElement(el) || el.hasAttribute('data-translated')) return;

			// Walk child text nodes
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			let current: Node | null = walker.nextNode();
			
			while (current) {
				const textNode = current as Text;
				const parent = textNode.parentElement;
				
				if (parent && !shouldSkipElement(parent) && !parent.hasAttribute('data-translated')) {
					const value = textNode.nodeValue ?? '';
					const normalized = normalizeText(value);
					
					if (normalized && normalized.length >= 2 && !shouldNotTranslateText(normalized)) {
						const context = getParentContext(textNode);
						const parentTag = parent.tagName.toLowerCase();

						let id = uniqueMap.get(normalized);
						if (!id) {
							id = `seg-${uniqueMap.size}`;
							uniqueMap.set(normalized, id);
							segments.push({ id, text: normalized, context, parentTag });
						}

						entries.push({
							node: textNode,
							normalized,
							leading: value.match(/^\s*/)?.[0] ?? '',
							trailing: value.match(/\s*$/)?.[0] ?? '',
							segmentId: id,
							context,
							parentTag
						});
					}
				}
				current = walker.nextNode();
			}
		}
	});

	return { nodes: entries, segments };
};

// ============================================================================
// OBSERVER MANAGEMENT
// ============================================================================

export const startTranslationObserver = () => {
	if (!browser || observer) return;
	
	observer = new MutationObserver(handleMutations);
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		characterData: true
	});
	
	console.log('[Translation] MutationObserver started');
};

export const stopTranslationObserver = () => {
	if (observer) {
		observer.disconnect();
		observer = null;
		console.log('[Translation] MutationObserver stopped');
	}
};

// ============================================================================
// PHASE 4: RESTORE ORIGINAL TEXT
// ============================================================================

const restoreOriginalText = () => {
	// Restore text nodes
	for (const [node, value] of originalTextCache.entries()) {
		if (node.isConnected) {
			node.textContent = value;
		}
	}
	originalTextCache.clear();

	// Restore attributes
	const attrElements = document.querySelectorAll<HTMLElement>(
		'[data-orig-placeholder], [data-orig-title], [data-orig-aria-label], [data-orig-alt], [data-orig-aria-description], [data-orig-aria-placeholder], [data-orig-aria-valuetext], [data-orig-aria-roledescription]'
	);
	
	attrElements.forEach((el) => {
		const attrs = ['placeholder', 'title', 'aria-label', 'alt', 'aria-description', 'aria-placeholder', 'aria-valuetext', 'aria-roledescription'] as const;
		
		attrs.forEach((attr) => {
			const val = el.getAttribute(`data-orig-${attr}`);
			if (val !== null) {
				el.setAttribute(attr, val);
			}
		});
	});

	// Restore title
	if (document.documentElement.dataset.origTitle) {
		document.title = document.documentElement.dataset.origTitle;
	}

	// Remove translated markers
	document.querySelectorAll('[data-translated]').forEach((el) => {
		el.removeAttribute('data-translated');
	});

	// Clear glossary
	glossary.clear();
};

// ============================================================================
// MAIN TRANSLATION FUNCTION - PHASE 1
// ============================================================================

export const translatePageTo = async (languageCode: string, showLoading = true): Promise<boolean> => {
	if (!browser) return true;

	console.log(`[Translation] Starting translation to ${languageCode}, showLoading: ${showLoading}`);

	requestCounter += 1;
	const requestId = requestCounter;
	const root = document.documentElement;

	// Handle returning to English (original)
	if (languageCode === 'EN') {
		try {
			stopTranslationObserver();
			restoreOriginalText();
			translationStatus.set('original');
			root.dataset.translationState = 'original';
			root.dataset.translationLanguage = 'EN';
			root.lang = 'en';
			
			// Clear cache markers
			document.querySelectorAll('[data-kazakh-text]').forEach((el) => {
				el.removeAttribute('data-kazakh-text');
			});
			
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
		currentLanguage = languageCode;

		// Wait for Font Agent to be ready (PHASE 4)
		if (!fontAgentReady) {
			await sleep(FONT_AGENT_RETRY_DELAY_MS);
		}

		// PHASE 1: Collect all text nodes from full DOM
		const { nodes, segments } = collectAllTextNodes();

		if (!nodes.length && !segments.length) {
			if (showLoading) {
				translationStatus.set('translated');
				root.dataset.translationState = 'translated';
			}
			return true;
		}

		console.log(`[Translation] Found ${nodes.length} nodes and ${segments.length} unique segments`);

		// PHASE 1: Create chunks for batch processing
		const chunks = createChunks(segments);

		// PHASE 1: Process chunks in parallel
		await Promise.all(
			chunks.map(async (chunk) => {
				await translateChunk(chunk, languageCode);
			})
		);

		// Verify this is still the active request
		if (requestId !== requestCounter) {
			return true;
		}

		// Apply all translations
		const cache = ensureLanguageCache(languageCode);
		const translatedNodes = applyTranslationsToNodes(nodes, cache);

		console.log(`[Translation] Applied ${translatedNodes.size} translations to DOM`);

		// PHASE 2: Dispatch event for Font Agent
		if (translatedNodes.size > 0) {
			document.body.dispatchEvent(new CustomEvent('translationChunkDone', {
				bubbles: true,
				detail: { nodes: Array.from(translatedNodes) }
			}));
			
			// PHASE 3: Check font coverage
			checkAndDispatchFontEvent(translatedNodes);
		}

		if (showLoading) {
			translationStatus.set('translated');
			root.dataset.translationState = 'translated';
		}

		// PHASE 2: Start observing for future changes
		startTranslationObserver();

		console.log('[Translation] Page translation complete');
		return true;
	} catch (error) {
		console.error('[Translation] Failed to translate page:', error);
		if (showLoading) {
			translationStatus.set('error');
			root.dataset.translationState = 'error';
		}
		return false;
	}
};

// ============================================================================
// SPANavigation - Re-run translation on page change
// ============================================================================

let lastUrl = '';

export const initSPANavigation = () => {
	if (!browser) return;

	const checkUrlChange = () => {
		const currentUrl = window.location.href;
		if (currentUrl !== lastUrl && lastUrl !== '') {
			// URL changed - re-translate the new page
			const currentLang = document.documentElement.dataset.translationLanguage;
			if (currentLang && currentLang !== 'EN') {
				// Clear previous translation markers
				restoreOriginalText();
				// Translate new page
				translatePageTo(currentLang, true);
			}
		}
		lastUrl = currentUrl;
	};

	// Check for URL changes (SPA navigation)
	if (typeof window !== 'undefined') {
		lastUrl = window.location.href;
		window.addEventListener('popstate', checkUrlChange);
		
		// Also use MutationObserver to detect SPA navigation
		const navObserver = new MutationObserver(checkUrlChange);
		navObserver.observe(document.body, { childList: true, subtree: true });
	}
};

// ============================================================================
// FONT AGENT READINESS (PHASE 4)
// ============================================================================

export const setFontAgentReady = (ready: boolean) => {
	fontAgentReady = ready;
	if (ready) {
		console.log('[Translation] Font Agent is ready');
	}
};

// Listen for Font Agent ready event
if (browser) {
	document.addEventListener('fontAgentReady', () => {
		setFontAgentReady(true);
	});
}
