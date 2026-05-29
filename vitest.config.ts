import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST })],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        exclude: ['**/node_modules/**', '**/.kilo/**', '**/dist/**']
    },
    resolve: {
        conditions: ['browser'],
        alias: {
            $lib: path.resolve('./src/lib'),
            $components: path.resolve('./src/lib/components'),
            // SvelteKit virtual modules — resolved to lightweight mocks so unit and
            // server tests can import server utilities without the SvelteKit build pipeline.
            '$app/environment':    path.resolve('./tests/__mocks__/app-environment.ts'),
            '$app/navigation':     path.resolve('./tests/__mocks__/app-navigation.ts'),
            '$env/dynamic/private': path.resolve('./tests/__mocks__/env-dynamic-private.ts'),
            '$env/static/private':  path.resolve('./tests/__mocks__/env-static-private.ts')
        }
    }
});
