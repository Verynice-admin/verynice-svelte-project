// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
			// interface Error {}
		interface Locals {
			isAuthenticated: boolean;
			uid: string | null;
			role: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		gtag?: (command: string, ...args: any[]) => void;
	}
}

export {};
