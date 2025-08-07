// src/lib/utils/assetLoader.js

// A simple flag to ensure we only run this once.
let hasLoaded = false;

function loadCss(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Load scripts in order
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.body.appendChild(script);
    });
}

export function loadThirdPartyAssets() {
    if (hasLoaded) return;
    hasLoaded = true;

    console.log("Loading all third-party assets...");

    // Load the Fotorama CSS
    loadCss("https://cdnjs.cloudflare.com/ajax/libs/fotorama/4.6.4/fotorama.css");

    // Load scripts in sequence
    loadScript("https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js")
        .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/fotorama/4.6.4/fotorama.js"))
        .then(() => loadScript("https://yastatic.net/share2/share.js"))
        .then(() => console.log("All third-party scripts loaded successfully."))
        .catch(error => console.error("A script failed to load:", error));
}