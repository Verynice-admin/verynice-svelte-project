/**
 * Initializes a "toggler" that hides one sidebar element when another is hovered.
 * This version uses direct style manipulation to bypass CSS specificity issues.
 * @param triggerSelector - The selector for the element that triggers the effect (e.g., the TOC).
 * @param targetSelector - The selector for the element that will be hidden (e.g., the Key Facts).
 */
export function initSidebarToggler(
  triggerSelector: string,
  targetSelector: string,
  options: {
    enterDelay?: number;
    leaveDelay?: number;
    bodyClass?: string;
  } = {}
): () => void {
  if (typeof document === 'undefined') return () => {};

  const { enterDelay = 80, leaveDelay = 120, bodyClass = 'is-keyfacts-hidden' } = options;

  const trigger = document.querySelector(triggerSelector);
  const target = document.querySelector(targetSelector) as HTMLElement | null;
  if (!trigger || !target) return () => {};

  // reset any leftover inline styles/HMR residue
  target.style.opacity = '';
  target.style.transform = '';
  target.style.pointerEvents = '';
  target.removeAttribute('data-hidden');
  document.body.classList.remove(bodyClass);

  let enterT: ReturnType<typeof setTimeout>;
  let leaveT: ReturnType<typeof setTimeout>;
  
  const hide = () => {
    document.body.classList.add(bodyClass);
    target.setAttribute('data-hidden', 'true');
  };
  
  const show = () => {
    document.body.classList.remove(bodyClass);
    target.removeAttribute('data-hidden');
  };

  const onEnter = () => {
    clearTimeout(leaveT);
    enterT = setTimeout(hide, enterDelay);
  };
  
  const onLeave = () => {
    clearTimeout(enterT);
    leaveT = setTimeout(show, leaveDelay);
  };
  
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') show();
  };

  trigger.addEventListener('mouseenter', onEnter);
  trigger.addEventListener('mouseleave', onLeave);
  trigger.addEventListener('focusin', onEnter);
  trigger.addEventListener('focusout', onLeave);
  window.addEventListener('keydown', onEsc);

  return () => {
    trigger.removeEventListener('mouseenter', onEnter);
    trigger.removeEventListener('mouseleave', onLeave);
    trigger.removeEventListener('focusin', onEnter);
    trigger.removeEventListener('focusout', onLeave);
    window.removeEventListener('keydown', onEsc);
    clearTimeout(enterT);
    clearTimeout(leaveT);
    show();
  };
}

