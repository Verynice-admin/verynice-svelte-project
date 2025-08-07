/**
 * Initializes a "toggler" that hides one sidebar element when another is hovered.
 * This version uses direct style manipulation to bypass CSS specificity issues.
 * @param {string} triggerSelector - The selector for the element that triggers the effect (e.g., the TOC).
 * @param {string} targetSelector - The selector for the element that will be hidden (e.g., the Key Facts).
 */
export function initSidebarToggler(triggerSelector, targetSelector) {
    const triggerElement = document.querySelector(triggerSelector);
    const targetElement = document.querySelector(targetSelector);

    if (!triggerElement || !targetElement) {
        return;
    }

    // Set the transition property on the target element once.
    // This ensures any changes to its style will be animated smoothly.
    targetElement.style.transition = 'opacity 0.35s ease-in-out, transform 0.35s ease-in-out';

    // When the mouse enters the TOC area...
    triggerElement.addEventListener('mouseenter', () => {
        // ...directly set the styles to make it fade out.
        targetElement.style.opacity = '0';
        targetElement.style.transform = 'translateY(20px)';
        targetElement.style.pointerEvents = 'none';
    });

    // When the mouse leaves the TOC area...
    triggerElement.addEventListener('mouseleave', () => {
        // ...directly set the styles to make it fade back in.
        targetElement.style.opacity = '1';
        targetElement.style.transform = 'translateY(0)';
        targetElement.style.pointerEvents = 'auto';
    });

    console.log("Sidebar Toggler Initialized (Direct Style Method).");
}