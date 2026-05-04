import { redirect } from '@sveltejs/kit';

/**
 * Redirect old /traveller-portal URL to new /get-started URL
 */
export function load() {
	throw redirect(307, '/get-started');
}
