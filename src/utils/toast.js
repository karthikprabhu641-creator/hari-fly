export function showToast(text, duration = 2000) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('hari-fly-toast', {
    detail: { text: String(text || ''), duration },
  }));
}
