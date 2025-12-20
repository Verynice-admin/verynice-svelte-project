const loadedScripts = new Map<string, Promise<void>>();

export function loadExternalScript(src: string): Promise<void> {
    if (loadedScripts.has(src)) {
        return loadedScripts.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = () => resolve();
        script.onerror = () => {
            console.error(`Failed to load script: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };

        document.head.appendChild(script);
    });

    loadedScripts.set(src, promise);
    return promise;
}