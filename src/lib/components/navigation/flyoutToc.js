/**
 * Initializes the hover-to-reveal behavior for the fly-out Table of Contents.
 * @param {string} tocSelector - The CSS selector for the fly-out TOC element (e.g., '.tocmenu').
 */
export function initFlyoutToc(tocSelector) {
    const tocElement = document.querySelector(tocSelector);

    if (!tocElement) {
        // If the TOC isn't on this page, do nothing.
        return;
    }

    // Add a class to the TOC to indicate it's been initialized by JS.
    // This class will be used in CSS to handle the initial hidden state.
    tocElement.classList.add('js-flyout-toc');

    // Event listener to show the TOC when the mouse enters its area.
    tocElement.addEventListener('mouseenter', () => {
        tocElement.classList.add('is-active');
    });

    // Event listener to hide the TOC when the mouse leaves its area.
    tocElement.addEventListener('mouseleave', () => {
        tocElement.classList.remove('is-active');
    });

    console.log("Fly-out TOC initialized.");
}