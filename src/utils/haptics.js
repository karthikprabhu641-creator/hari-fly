export function vibrate(pattern) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}
