// Installable app: service worker (offline play) and "Install" button support.
//  - Android / Chrome / Edge: the browser's install prompt, shown from the menu button;
//  - iPhone / iPad (no install prompt): instructions for "Add to Home Screen".
// Once installed, the game opens fullscreen in landscape (see public/manifest.webmanifest).
import './install.css';
import { t } from '../i18n/i18n.js';

const hasWindow = typeof window !== 'undefined';
const media = (query) => hasWindow && !!window.matchMedia && window.matchMedia(query).matches;

// Launched from the home screen (not from a browser tab)? Checked at startup, before the
// Fullscreen API can make "display-mode: fullscreen" match in a browser tab.
const launchedAsApp =
  hasWindow &&
  (window.navigator.standalone === true || media('(display-mode: standalone)') || media('(display-mode: fullscreen)'));

const isIos =
  hasWindow &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)); // iPadOS

let deferredPrompt = null;
let installed = false;
const listeners = new Set();
const notify = () => listeners.forEach((cb) => cb());

/** true when the game runs as an installed app (home screen icon). */
export function isLaunchedAsApp() {
  return launchedAsApp;
}

/** 'prompt' (the browser can install it), 'ios' (show instructions) or null. */
export function getInstallMode() {
  if (launchedAsApp || installed) return null;
  if (deferredPrompt) return 'prompt';
  if (isIos) return 'ios';
  return null;
}

/** Called when getInstallMode() may have changed. Returns an unsubscribe function. */
export function onInstallModeChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function installApp() {
  if (deferredPrompt) {
    const prompt = deferredPrompt;
    deferredPrompt = null; // a prompt can only be used once
    notify();
    try {
      await prompt.prompt();
    } catch {
      // The browser refused to show it (e.g. not a user gesture)
    }
    return;
  }
  if (isIos) showIosInstallHint();
}

function showIosInstallHint() {
  let hint = document.getElementById('install-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'install-hint';
    hint.setAttribute('role', 'dialog');
    hint.setAttribute('aria-labelledby', 'install-hint-text');
    hint.innerHTML =
      '<div class="install-icon" aria-hidden="true">📲</div>' +
      '<p id="install-hint-text"></p>' +
      '<button id="install-hint-ok" type="button"></button>';
    document.body.append(hint);
    hint.querySelector('button').addEventListener('click', () => {
      hint.hidden = true;
    });
  }
  hint.querySelector('p').textContent = t('installHintIos');
  hint.querySelector('button').textContent = t('installHintOk');
  hint.hidden = false;
  hint.querySelector('button').focus();
}

export function initPwa() {
  if (!hasWindow) return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // no mini-infobar over the game: the menu has an "Install" button
    deferredPrompt = event;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });

  // Offline play (production builds only: the dev server serves unbundled files).
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Not supported here (e.g. private browsing): the game works online anyway
      });
    });
  }
}
