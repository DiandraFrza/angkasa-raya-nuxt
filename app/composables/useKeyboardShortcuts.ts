/** @format */

import { nextTick, onMounted, onUnmounted, watch, type Ref } from "vue";

interface EscapeEntry {
  id: symbol;
  dismiss: () => void;
}

const clientEscapeStack: EscapeEntry[] = [];
let escapeListenerBound = false;

const handleGlobalEscape = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;
  const top = clientEscapeStack[clientEscapeStack.length - 1];
  if (!top) return;

  event.preventDefault();
  event.stopPropagation();
  top.dismiss();
};

const ensureEscapeListener = () => {
  if (typeof window === "undefined" || escapeListenerBound) return;
  window.addEventListener("keydown", handleGlobalEscape, true);
  escapeListenerBound = true;
};

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

export function hasOpenModalOverlay(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector('[aria-modal="true"]'));
}

export async function focusFirstInput(container: HTMLElement | null) {
  if (typeof window === "undefined") return;
  await nextTick();
  if (!container) return;

  const selector = [
    'input:not([type="hidden"]):not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([disabled]):not([readonly]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([readonly]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
  ].join(", ");

  const candidates = Array.from(container.querySelectorAll<HTMLElement>(selector));
  const firstVisible = candidates.find((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
  });

  if (firstVisible) {
    firstVisible.focus();
    return;
  }

  const fallbackFocusable = container.querySelector<HTMLElement>(
    'button:not([disabled]):not([tabindex="-1"]), [href], [tabindex="0"]',
  );
  fallbackFocusable?.focus();
}

export function useModalAutoFocus(isOpen: () => boolean, containerRef: Ref<HTMLElement | null>) {
  let stopWatch: (() => void) | null = null;

  onMounted(() => {
    stopWatch = watch(
      isOpen,
      async (open) => {
        if (open) {
          await focusFirstInput(containerRef.value);
        }
      },
      { immediate: true, flush: "post" },
    );
  });

  onUnmounted(() => {
    stopWatch?.();
    stopWatch = null;
  });
}

export function useEscapeDismiss(isOpen: () => boolean, onDismiss: () => void) {
  const entryId = Symbol("escape-dismiss");
  let stopWatch: (() => void) | null = null;

  const removeEntry = () => {
    const idx = clientEscapeStack.findIndex((item) => item.id === entryId);
    if (idx !== -1) {
      clientEscapeStack.splice(idx, 1);
    }
  };

  onMounted(() => {
    ensureEscapeListener();

    stopWatch = watch(
      isOpen,
      (open) => {
        if (open) {
          removeEntry();
          clientEscapeStack.push({ id: entryId, dismiss: onDismiss });
        } else {
          removeEntry();
        }
      },
      { immediate: true },
    );
  });

  onUnmounted(() => {
    stopWatch?.();
    stopWatch = null;
    removeEntry();
  });
}

export function useQuickSearchShortcut(inputRef: Ref<HTMLInputElement | null>) {
  const handleKeydown = (event: KeyboardEvent) => {
    if (hasOpenModalOverlay()) return;

    const isSlash = event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey;
    const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && !event.altKey;

    if (!isSlash && !isCtrlK) return;

    if (isEditableTarget(event.target) || isEditableTarget(document.activeElement)) {
      return;
    }

    const input = inputRef.value;
    if (!input || input.disabled) return;

    event.preventDefault();
    input.focus();
  };

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
}
