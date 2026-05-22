import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultLang = 'EN';
const supported = ['EN', 'KK', 'RU', 'FR', 'DE', 'ES', 'ZH', 'JA', 'AR'];

const getBrowserLang = (): string => {
    if (!browser) return defaultLang;
    const navLang = navigator.language.split('-')[0].toUpperCase();
    return supported.includes(navLang) ? navLang : defaultLang;
};

const initialLang = browser
    ? localStorage.getItem('language') || getBrowserLang()
    : defaultLang;

export const currentLanguage = writable<string>(initialLang);

if (browser) {
    currentLanguage.subscribe(value => {
        localStorage.setItem('language', value);
    });
}
