import type { RequestHandler } from './$types';
import { logger } from '$lib/server/logger';
import { enforceRateLimit } from '$lib/server/rateLimit';

// Receives CSP violation reports sent by browsers.
// Configured via the Content-Security-Policy report-uri / report-to directives.
export const POST: RequestHandler = async ({ request }) => {
	// Silently drop excess reports — always return 204 so the browser does not
	// retry. 60 reports/min per IP is generous for legitimate browser reporting.
	const rate = await enforceRateLimit({
		request,
		scope: 'api-csp-report',
		maxRequests: 60,
		windowMs: 60_000
	});
	if (!rate.allowed) return new Response(null, { status: 204 });

	try {
		const body = await request.json();
		const report = body?.['csp-report'] ?? body;
		logger.warn('[csp] violation', {
			blockedUri: report?.['blocked-uri'] ?? report?.blockedURL,
			violatedDirective: report?.['violated-directive'] ?? report?.effectiveDirective,
			documentUri: report?.['document-uri'] ?? report?.documentURL,
			sourceFile: report?.['source-file'],
			lineNumber: report?.['line-number'],
			columnNumber: report?.['column-number'],
		});
	} catch {
		// Malformed body — still return 204 so the browser doesn't retry
	}

	return new Response(null, { status: 204 });
};
