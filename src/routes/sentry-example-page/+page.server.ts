import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const load: PageServerLoad = async () => {
	if (!dev) {
		redirect(302, '/');
	}
	return {};
};
