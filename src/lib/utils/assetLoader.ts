// src/lib/utils/assetLoader.ts
let hasLoaded = false;

function loadCss(href: string): void {
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function loadThirdPartyAssets(): void {
  if (hasLoaded) return;
  hasLoaded = true;
  loadCss('/vendor/fotorama/fotorama.css');
}




























































