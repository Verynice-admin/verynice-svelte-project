import { writable, derived } from 'svelte/store';
import type { User } from 'firebase/auth';

interface UserProfile {
	uid: string;
	email: string | null;
	role: 'traveller' | 'business' | null;
}

/**
 * User store that holds the current authenticated user
 */
export const user = writable<User | null>(null);

/**
 * User profile store that holds additional user data from Firestore
 */
export const userProfile = writable<UserProfile | null>(null);

/**
 * Derived store to check if user is authenticated
 */
export const isAuthenticated = derived(user, ($user) => $user !== null);

/**
 * Derived store to check if user has a specific role
 */
export const hasRole = derived(userProfile, ($profile) => $profile?.role ?? null);
