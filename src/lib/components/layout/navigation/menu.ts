// src/js/components/navigation/menu.js
export type MenuOptions = {
  menuSelector?: string;
  fullMenuSelector?: string;
  toggleSelector?: string;
};

export class Menu {
  options: Required<MenuOptions>;
  menu: HTMLElement | null;
  fullMenuContainer: HTMLElement | null;
  toggleBtn: HTMLElement | null;
  private _boundResize: () => void;

  constructor(options: MenuOptions = {}) {
    this.options = {
      menuSelector: options.menuSelector ?? '#site-header',
      fullMenuSelector: options.fullMenuSelector ?? '#mobile-menu',
      toggleSelector: options.toggleSelector ?? '[data-menu-toggle]'
    };
    this.menu = document.querySelector(this.options.menuSelector);
    this.fullMenuContainer = document.querySelector(this.options.fullMenuSelector);
    this.toggleBtn = document.querySelector(this.options.toggleSelector);
    this._boundResize = () => applyMobileMenuOffset();
    this.init();
  }

  init() {
    if (!this.menu) {
      console.warn('[Menu] header not found:', this.options.menuSelector);
      return;
    }
    if (this.fullMenuContainer) {
      const open = this.fullMenuContainer.getAttribute('data-open') === 'true';
      this.fullMenuContainer.setAttribute('aria-hidden', String(!open));
    }
    if (this.toggleBtn && this.fullMenuContainer) {
      this.toggleBtn.addEventListener('click', () => {
        const open = this.fullMenuContainer!.getAttribute('data-open') === 'true';
        const next = !open;
        this.fullMenuContainer!.setAttribute('data-open', String(next));
        this.fullMenuContainer!.setAttribute('aria-hidden', String(!next));
        applyMobileMenuOffset();
      });
    } else {
      console.warn('[Menu] toggle or full menu not found', {
        toggle: !!this.toggleBtn,
        fullMenu: !!this.fullMenuContainer
      });
    }
    applyMobileMenuOffset();
    window.addEventListener('resize', this._boundResize);
    window.addEventListener('orientationchange', this._boundResize);
    console.log('Menu Initialized');
  }

  destroy() {
    window.removeEventListener('resize', this._boundResize);
    window.removeEventListener('orientationchange', this._boundResize);
  }
}

function getHeaderHeight(): number {
  const header = document.getElementById('site-header');
  return header ? (header as HTMLElement).offsetHeight : 64;
}

export function applyMobileMenuOffset(): void {
  const menu =
    (document.getElementById('mobile-menu') as HTMLElement | null) ||
    (document.querySelector('.mobile-menu') as HTMLElement | null) ||
    (document.querySelector('.fullmenu') as HTMLElement | null);
  const h = getHeaderHeight();
  if (menu) {
    const useDvh = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('height: 100dvh');
    const unit = useDvh ? 'dvh' : 'vh';
    menu.style.top = `${h}px`;
    menu.style.height = `calc(100${unit} - ${h}px)`;
  }
}

// Convenience initializer
export function initMenu(opts?: MenuOptions) {
  if (typeof window === 'undefined') return null;
  return new Menu(opts);
}