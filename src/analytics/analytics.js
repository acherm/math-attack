import { getLang, t } from '../i18n/i18n.js';
import './consent.css';

const GA_ID = 'G-92TRR0HJMQ';
const CONSENT_KEY = 'jdubois-analytics-consent';
const LEVEL_EVENTS = new Set(['level_start', 'level_end', 'level_restart', 'level_exit']);
let consent = null;
let loaded = false;
let showSettings;

export function showAnalyticsSettings() {
  showSettings();
}

function readConsent() {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    // As on the website, storage restrictions leave the choice in memory.
    return consent;
  }
}

function clearCookies() {
  const host = window.location.hostname;
  const labels = host.split('.');
  const domains = ['', host, '.' + host];
  if (labels.length > 2) domains.push('.' + labels.slice(-2).join('.'));
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name === '_ga' || name === '_gid' || name.startsWith('_ga_') || name.startsWith('_gat')) {
      domains.forEach((domain) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${domain ? '; domain=' + domain : ''}`;
      });
    }
  });
}

function applyConsent(value) {
  consent = value;
  window['ga-disable-' + GA_ID] = value !== 'granted';
  if (value !== 'granted') {
    if (loaded) {
      // Drop unsent gameplay events without losing initialization if gtag.js is still loading.
      for (let i = window.dataLayer.length - 1; i >= 0; i--) {
        if (window.dataLayer[i][0] === 'event') window.dataLayer.splice(i, 1);
      }
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    clearCookies();
    return;
  }
  if (loaded) {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    app_name: 'math_attack',
    page_title: "Ben & Alice's Math Attack",
    page_location: window.location.origin + window.location.pathname,
    page_referrer: '',
    cookie_path: '/',
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

export function trackLevelEvent(name, scene) {
  if (consent !== 'granted' || !loaded || !LEVEL_EVENTS.has(name)) return;
  window.gtag('event', name, {
    send_to: GA_ID,
    app_name: 'math_attack',
    level_number: scene.levelNumber,
    game_mode: scene.gameMode,
    game_language: getLang(),
    ...(name === 'level_end' ? { success: true } : {})
  });
}

export function initAnalytics() {
  const dialog = document.getElementById('analytics-consent');
  const accept = document.getElementById('analytics-accept');
  const decline = document.getElementById('analytics-decline');

  function localize() {
    document.documentElement.lang = getLang();
    document.querySelectorAll('[data-analytics-text]').forEach((element) => {
      element.textContent = t(element.dataset.analyticsText);
    });
  }

  function show() {
    localize();
    dialog.showModal();
    decline.focus();
  }
  showSettings = show;

  function choose(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // The in-memory choice still applies when storage is unavailable.
    }
    applyConsent(value);
    dialog.close();
    document.getElementById('game-container').focus();
  }

  localize();
  applyConsent(readConsent());
  if (consent === null) show();
  accept.addEventListener('click', () => choose('granted'));
  decline.addEventListener('click', () => choose('denied'));
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    if (consent === null) choose('denied');
    else {
      dialog.close();
      document.getElementById('game-container').focus();
    }
  });
  // Phaser must not interpret consent-dialog typing as game shortcuts.
  dialog.addEventListener('keydown', (event) => event.stopPropagation());
  document.addEventListener('languagechange', localize);
  window.addEventListener('storage', (event) => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    applyConsent(readConsent());
    if (consent === null) {
      if (!dialog.open) show();
    } else {
      dialog.close();
    }
  });
}
