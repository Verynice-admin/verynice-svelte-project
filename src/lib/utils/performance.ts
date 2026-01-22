// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
	fcp?: number; // First Contentful Paint
	lcp?: number; // Largest Contentful Paint
	fid?: number; // First Input Delay
	cls?: number; // Cumulative Layout Shift
	ttfb?: number; // Time to First Byte
}

// Report Web Vitals
export function reportWebVitals(metric: PerformanceMetrics) {
	if (typeof window === 'undefined') return;

	// Log to console in development
	if (import.meta.env.DEV) {
		console.log('Web Vital:', metric);
	}

	// Send to analytics in production
	if (import.meta.env.PROD && window.gtag) {
		window.gtag('event', 'web_vitals', metric);
	}
}

// Measure performance metrics
export function measurePerformance() {
	if (typeof window === 'undefined' || !window.performance) return;

	try {
		// Get Navigation Timing
		const perfData = window.performance.timing;
		const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
		const connectTime = perfData.responseEnd - perfData.requestStart;
		const renderTime = perfData.domComplete - perfData.domLoading;

		const metrics: PerformanceMetrics = {
			ttfb: perfData.responseStart - perfData.navigationStart
		};

		// Get Paint Timing
		const paintEntries = performance.getEntriesByType('paint');
		paintEntries.forEach((entry) => {
			if (entry.name === 'first-contentful-paint') {
				metrics.fcp = entry.startTime;
			}
		});

		// Get Largest Contentful Paint
		const observer = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1];
			metrics.lcp = lastEntry.startTime;
			reportWebVitals(metrics);
		});

		observer.observe({ entryTypes: ['largest-contentful-paint'] });

		return metrics;
	} catch (error) {
		console.error('Failed to measure performance:', error);
	}
}

// Prefetch resources for next navigation
export function prefetchRoute(url: string) {
	if (typeof window === 'undefined') return;

	const link = document.createElement('link');
	link.rel = 'prefetch';
	link.href = url;
	document.head.appendChild(link);
}

// Preconnect to external domains
export function preconnect(url: string, crossorigin = false) {
	if (typeof window === 'undefined') return;

	const link = document.createElement('link');
	link.rel = 'preconnect';
	link.href = url;
	if (crossorigin) {
		link.crossOrigin = 'anonymous';
	}
	document.head.appendChild(link);
}

// Lazy load images with Intersection Observer
export function lazyLoadImages(selector = 'img[loading="lazy"]') {
	if (typeof window === 'undefined') return;

	const images = document.querySelectorAll(selector);

	if ('IntersectionObserver' in window) {
		const imageObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const img = entry.target as HTMLImageElement;
					if (img.dataset.src) {
						img.src = img.dataset.src;
						img.removeAttribute('data-src');
					}
					imageObserver.unobserve(img);
				}
			});
		}, {
			rootMargin: '50px 0px',
			threshold: 0.01
		});

		images.forEach((img) => imageObserver.observe(img));
	} else {
		// Fallback for browsers without Intersection Observer
		images.forEach((img: Element) => {
			const image = img as HTMLImageElement;
			if (image.dataset.src) {
				image.src = image.dataset.src;
			}
		});
	}
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			func(...args);
		};

		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;

	return function executedFunction(...args: Parameters<T>) {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get connection quality
export function getConnectionQuality(): 'slow' | 'fast' | 'unknown' {
	if (typeof navigator === 'undefined' || !('connection' in navigator)) {
		return 'unknown';
	}

	const conn = (navigator as any).connection;
	if (!conn) return 'unknown';

	// Check effective connection type
	if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
		return 'slow';
	}

	// Check save data mode
	if (conn.saveData) {
		return 'slow';
	}

	return 'fast';
}

// Resource Priority Hints
export function setResourcePriority(element: HTMLElement, priority: 'high' | 'low' | 'auto') {
	if ('fetchPriority' in element) {
		(element as any).fetchPriority = priority;
	}
}
