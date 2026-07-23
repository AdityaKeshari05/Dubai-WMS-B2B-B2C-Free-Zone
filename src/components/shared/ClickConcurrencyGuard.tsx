'use client';

import { useEffect } from 'react';

const DEFAULT_LOCK_MS = 900;
const SUBMIT_LOCK_MS = 4000;

function closestLockable(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest('button, [role="button"]') as HTMLElement | null;
}

function lockDuration(element: HTMLElement) {
  const configured = Number(element.dataset.clickLockMs);
  if (Number.isFinite(configured) && configured > 0) return configured;
  if (element instanceof HTMLButtonElement && (element.type || 'submit') === 'submit') return SUBMIT_LOCK_MS;
  return DEFAULT_LOCK_MS;
}

function isDisabled(element: HTMLElement) {
  return element.getAttribute('aria-disabled') === 'true' || (element instanceof HTMLButtonElement && element.disabled);
}

export function ClickConcurrencyGuard() {
  useEffect(() => {
    const lockedUntil = new WeakMap<HTMLElement, number>();
    const unlockTimers = new WeakMap<HTMLElement, number>();

    const unlock = (element: HTMLElement) => {
      element.classList.remove('pointer-events-none', 'opacity-60');
      element.removeAttribute('aria-busy');
      lockedUntil.delete(element);
      unlockTimers.delete(element);
    };

    const onClickCapture = (event: MouseEvent) => {
      const element = closestLockable(event.target);
      if (!element || element.dataset.clickLock === 'off' || isDisabled(element)) return;

      const now = Date.now();
      const until = lockedUntil.get(element);
      if (until && until > now) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      const duration = lockDuration(element);
      lockedUntil.set(element, now + duration);
      window.queueMicrotask(() => {
        element.classList.add('pointer-events-none', 'opacity-60');
        element.setAttribute('aria-busy', 'true');
      });

      const existingTimer = unlockTimers.get(element);
      if (existingTimer) window.clearTimeout(existingTimer);
      const timer = window.setTimeout(() => unlock(element), duration);
      unlockTimers.set(element, timer);
    };

    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, []);

  return null;
}
