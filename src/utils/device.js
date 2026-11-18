/**
 * Device, Screen & Fullscreen Utilities
 */

export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 768px)').matches
  );
}

export function getDevicePixelRatio(maxDpr = 2.0) {
  if (typeof window === 'undefined') return 1;
  const dpr = window.devicePixelRatio || 1;
  return Math.min(dpr, maxDpr);
}

export function isFullscreen() {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

export async function requestFullscreen(element = document.documentElement) {
  try {
    if (isFullscreen()) return true;
    if (element.requestFullscreen) {
      await element.requestFullscreen();
      return true;
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
      return true;
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen();
      return true;
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    // Browsers reject if not triggered synchronously within user gesture
    console.debug('Fullscreen request deferred or blocked by browser policy:', err);
  }
  return false;
}

export async function exitFullscreen() {
  try {
    if (!isFullscreen()) return true;
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
      return true;
    } else if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen();
      return true;
    } else if (document.msExitFullscreen) {
      await document.msExitFullscreen();
      return true;
    }
  } catch (err) {
    console.debug('Exit fullscreen failed:', err);
  }
  return false;
}

export function toggleFullscreen(element = document.documentElement) {
  if (isFullscreen()) {
    return exitFullscreen();
  }
  return requestFullscreen(element);
}

