// src/js/components/navigation/menu.js
export class Menu {
    constructor(options) {
        this.options = options;
        this.menu = document.querySelector(options.menuSelector);
        this.fullMenuContainer = document.querySelector(options.fullMenuSelector);
        // ... other elements ...
        this.init();
    }

    init() {
        // ... your existing menu logic (cloning, toggling classes, event listeners) ...
        console.log("Menu Initialized");
    }
    // ... other methods ...
}