import { browser } from '$app/environment';

export const CONSENT_KEY = 'vn_cookie_consent';
export const CONSENT_VERSION = '2';

/** Returns true only when the user has explicitly accepted analytics cookies. */
export function hasConsent(): boolean {
	if (!browser) return false;
	const raw = localStorage.getItem(CONSENT_KEY);
	if (!raw) return false;
	try {
		const parsed = JSON.parse(raw);
		return parsed?.decision === 'accepted' && parsed?.v === CONSENT_VERSION;
	} catch {
		// legacy plain-string value from v1
		return raw === '1';
	}
}
