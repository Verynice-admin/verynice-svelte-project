import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import sveltePlugin from 'eslint-plugin-svelte';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.join(__dirname, '.gitignore');

export default [
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	{
		ignores: ['scripts/**', 'src/scripts/**', 'node_modules/**', '.svelte-kit/**', 'build/**', '.kilo/**']
	},
	{
		files: ['**/*.ts'],
		languageOptions: { parser: tsParser },
		plugins: { '@typescript-eslint': tsPlugin },
		rules: {
			...tsPlugin.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	...sveltePlugin.configs.recommended,
	{
		files: ['**/*.svelte'],
		rules: {
			'svelte/no-at-html-tags': 'warn'
		}
	},
	prettier
];