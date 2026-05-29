// Mock for SvelteKit's $env/dynamic/private virtual module.
// Returns empty strings for all private env vars so server utilities
// can be imported in tests without real credentials.
export const env: Record<string, string> = new Proxy({} as Record<string, string>, {
    get: (_target, prop) => (typeof prop === 'string' ? '' : undefined)
});
