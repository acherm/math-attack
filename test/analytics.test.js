import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const KEY = 'jdubois-analytics-consent';
const GA_ID = 'G-92TRR0HJMQ';
let analytics;
let elements;
let scripts;
let storage;
let cookies;

class Element extends EventTarget {
  open = false;
  dataset = {};
  focus = vi.fn();
  showModal() { this.open = true; }
  close() { this.open = false; }
}

function click(id) {
  elements[id].dispatchEvent(new Event('click'));
}

function commands() {
  return (window.dataLayer || []).map((args) => Array.from(args));
}

function storageChange(key, value) {
  if (value === null) storage.delete(KEY);
  else storage.set(KEY, value);
  const event = new Event('storage');
  Object.assign(event, { key, newValue: value });
  window.dispatchEvent(event);
}

beforeEach(async () => {
  vi.resetModules();
  storage = new Map();
  scripts = [];
  cookies = [];
  elements = Object.fromEntries([
    'analytics-consent', 'analytics-accept', 'analytics-decline', 'game-container'
  ].map((id) => [id, new Element()]));
  const doc = Object.assign(new EventTarget(), {
    documentElement: { lang: 'en' },
    getElementById: (id) => elements[id],
    querySelectorAll: () => [],
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) }
  });
  Object.defineProperty(doc, 'cookie', {
    get: () => '_ga=abc; _ga_92TRR0HJMQ=def; game_setting=keep',
    set: (cookie) => cookies.push(cookie)
  });
  vi.stubGlobal('document', doc);
  vi.stubGlobal('window', Object.assign(new EventTarget(), {
    location: { hostname: 'www.julien-dubois.com', origin: 'https://www.julien-dubois.com', pathname: '/math-attack/' },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    }
  }));
  analytics = await import('../src/analytics/analytics.js');
});

afterEach(() => vi.unstubAllGlobals());

describe('consent-gated game analytics', () => {
  it('does not load or queue analytics until acceptance, then sends only allowed event fields', () => {
    analytics.initAnalytics();
    expect(elements['analytics-consent'].open).toBe(true);
    analytics.trackLevelEvent('level_start', { levelNumber: 1, gameMode: '1p' });
    expect(scripts).toEqual([]);
    expect(window.dataLayer).toBeUndefined();
    click('analytics-accept');
    expect(storage.get(KEY)).toBe('granted');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
    for (const name of ['level_start', 'level_end', 'level_restart', 'level_exit']) {
      analytics.trackLevelEvent(name, {
        levelNumber: 3, gameMode: '2p-coop', winnerName: 'private', history: ['private']
      });
    }
    analytics.trackLevelEvent('answer', {});
    const events = commands().filter(([command]) => command === 'event');
    expect(events.map(([, name]) => name)).toEqual(['level_start', 'level_end', 'level_restart', 'level_exit']);
    expect(events[1][2]).toEqual({
      send_to: GA_ID, app_name: 'math_attack', level_number: 3,
      game_mode: '2p-coop', game_language: expect.stringMatching(/^(en|fr)$/), success: true
    });
    const config = commands().find(([command]) => command === 'config')[2];
    expect(config).toMatchObject({
      page_location: 'https://www.julien-dubois.com/math-attack/',
      page_referrer: '', allow_google_signals: false, allow_ad_personalization_signals: false
    });
  });

  it('honors website consent and stops immediately on withdrawal without replay or duplicate config', () => {
    storage.set(KEY, 'granted');
    analytics.initAnalytics();
    expect(elements['analytics-consent'].open).toBe(false);
    analytics.trackLevelEvent('level_start', { levelNumber: 1, gameMode: '1p' });
    analytics.showAnalyticsSettings();
    click('analytics-decline');
    const count = commands().length;
    analytics.trackLevelEvent('level_start', { levelNumber: 1, gameMode: '1p' });
    expect(commands()).toHaveLength(count);
    expect(window['ga-disable-' + GA_ID]).toBe(true);
    expect(cookies.some((cookie) => cookie.startsWith('_ga=; path=/;'))).toBe(true);
    expect(cookies.some((cookie) => cookie.startsWith('game_setting='))).toBe(false);
    analytics.showAnalyticsSettings();
    click('analytics-accept');
    expect(scripts).toHaveLength(1);
    expect(commands().filter(([command]) => command === 'config')).toHaveLength(1);
    expect(commands().filter(([command]) => command === 'event')).toHaveLength(0);
  });

  it('synchronizes grants, denials, and cleared consent from other same-origin tabs', () => {
    storage.set(KEY, 'denied');
    analytics.initAnalytics();
    expect(scripts).toEqual([]);
    storageChange(KEY, 'granted');
    expect(scripts).toHaveLength(1);
    storageChange(KEY, 'denied');
    expect(window['ga-disable-' + GA_ID]).toBe(true);
    storageChange(null, null);
    expect(elements['analytics-consent'].open).toBe(true);
  });

  it('keeps in-memory consent when storage is blocked and preserves it when closing settings', () => {
    window.localStorage.getItem = () => { throw new Error('blocked'); };
    window.localStorage.setItem = () => { throw new Error('blocked'); };
    analytics.initAnalytics();
    click('analytics-accept');
    analytics.showAnalyticsSettings();
    elements['analytics-consent'].dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(elements['analytics-consent'].open).toBe(false);
    expect(window['ga-disable-' + GA_ID]).toBe(false);
  });

  it('treats Escape on the initial prompt as decline', () => {
    analytics.initAnalytics();
    elements['analytics-consent'].dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(storage.get(KEY)).toBe('denied');
    expect(scripts).toEqual([]);
  });
});
