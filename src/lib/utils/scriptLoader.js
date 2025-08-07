// src/lib/utils/scriptLoader.js (CLEANED)

const loadedScripts = new Map();

export function loadScript(src) {
    if (loadedScripts.has(src)) {
        return loadedScripts.get(src);
    }

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = () => {
            // console.log(`Script loaded: ${src}`); // <-- REMOVED
            resolve();
        };

        script.onerror = () => {
            console.error(`Failed to load script: ${src}`); // Keeping this one is useful for future debugging
            reject(new Error(`Failed to load script: ${src}`));
        };

        document.head.appendChild(script);
    });

    loadedScripts.set(src, promise);
    return promise;
}