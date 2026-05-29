// Mock for SvelteKit's $app/environment virtual module.
// browser: true — keeps Svelte 5 in client mode so mount() works in jsdom.
export const browser = true;
export const dev = false;
export const building = false;
export const version = 'test';
