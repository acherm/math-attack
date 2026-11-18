// Mobile layer: touch detection, player preferences (controls, zoom), on-screen gamepad,
// "rotate your phone" hint and fullscreen helper.
//
// GameScene reads `touchState` every frame, alongside the keyboard
// (and see GameSceneTouch.js for the "touch the screen" controls).
import './touch-controls.css';
import { setTextVariants, t } from '../i18n/i18n.js';

const listeners = new Set();
const coarseQuery =
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;

let touchMode = !!(coarseQuery && coarseQuery.matches);

/** true when the game should show touch-friendly UI (big buttons, no keyboard hints). */
export function isTouchMode() {
  return touchMode;
}

/** Called with no args whenever touch mode flips on (e.g. first touch on a touchscreen laptop). */
export function onTouchModeChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function enableTouchMode() {
  if (touchMode) return;
  touchMode = true;
  document.documentElement.classList.add('touch');
  syncTextVariants();
  updateRotateHint();
  listeners.forEach((cb) => cb());
}

// ---------------------------------------------------------------------------
// Player preferences (remembered in localStorage)
// ---------------------------------------------------------------------------

function load(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage errors
  }
}

const CONTROLS_KEY = 'ben_alice_math_attack_controls';
const ZOOM_KEY = 'ben_alice_math_attack_zoom';

/**
 * How touch screens control the heroes:
 *  - 'screen':  touch where the hero should go (swipe up = jump, see GameSceneTouch.js)
 *  - 'buttons': on-screen ◀ ▶ pad + jump button
 */
let controlStyle = load(CONTROLS_KEY, 'screen') === 'buttons' ? 'buttons' : 'screen';

export function getControlStyle() {
  return controlStyle;
}

export function setControlStyle(style) {
  controlStyle = style === 'buttons' ? 'buttons' : 'screen';
  save(CONTROLS_KEY, controlStyle);
  syncTextVariants();
  return controlStyle;
}

// Texts: touch variants ('hudHintScreen', 'hudHintTouch'…) and no keyboard shortcuts.
function syncTextVariants() {
  setTextVariants(touchMode ? (controlStyle === 'screen' ? ['Screen', 'Touch'] : ['Touch']) : []);
}
syncTextVariants();

/** Extra zoom applied on top of "fill the screen" during a game (touch screens). */
export const ZOOM_LEVELS = [1, 1.35, 1.75];
let zoomIndex = Math.min(ZOOM_LEVELS.length - 1, Math.max(0, Number(load(ZOOM_KEY, 0)) || 0));

export function getZoomFactor() {
  return touchMode ? ZOOM_LEVELS[zoomIndex] : 1;
}

export function getZoomIndex() {
  return zoomIndex;
}

export function cycleZoom() {
  zoomIndex = (zoomIndex + 1) % ZOOM_LEVELS.length;
  save(ZOOM_KEY, zoomIndex);
  return zoomIndex;
}

// ---------------------------------------------------------------------------
// Shared input state read by the game loop (on-screen gamepad)
// ---------------------------------------------------------------------------

export const touchState = {
  p1: { left: false, right: false, jumpQueued: false },
  p2: { left: false, right: false, jumpQueued: false }
};

/** Returns true once per tap on the jump button of `player` ('p1' | 'p2'). */
export function consumeTouchJump(player) {
  const state = touchState[player];
  const queued = state.jumpQueued;
  state.jumpQueued = false;
  return queued;
}

function resetTouchState() {
  for (const player of ['p1', 'p2']) {
    touchState[player].left = false;
    touchState[player].right = false;
    touchState[player].jumpQueued = false;
  }
}

// ---------------------------------------------------------------------------
// On-screen gamepad (DOM)
// ---------------------------------------------------------------------------

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

/**
 * A single horizontal pad: the finger's position (left/right half) decides the
 * direction, and the finger can slide from one side to the other without lifting.
 */
function createDpad(player) {
  const pad = el('div', 'tc-dpad');
  const leftHalf = el('span', '', '◀');
  const rightHalf = el('span', '', '▶');
  pad.append(leftHalf, rightHalf);

  const pointers = new Map(); // pointerId -> 'left' | 'right'

  const refresh = () => {
    const dirs = [...pointers.values()];
    const left = dirs.includes('left');
    const right = dirs.includes('right');
    touchState[player].left = left;
    touchState[player].right = right;
    leftHalf.classList.toggle('on', left);
    rightHalf.classList.toggle('on', right);
  };

  const track = (e) => {
    const r = pad.getBoundingClientRect();
    pointers.set(e.pointerId, e.clientX < r.left + r.width / 2 ? 'left' : 'right');
    refresh();
  };

  const release = (e) => {
    pointers.delete(e.pointerId);
    refresh();
  };

  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try {
      pad.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is a nicety
    }
    track(e);
  });
  pad.addEventListener('pointermove', (e) => {
    if (pointers.has(e.pointerId)) track(e);
  });
  pad.addEventListener('pointerup', release);
  pad.addEventListener('pointercancel', release);
  pad.addEventListener('lostpointercapture', release);

  pad._reset = () => {
    pointers.clear();
    refresh();
  };
  return pad;
}

function createJumpButton(player, label) {
  const btn = el('div', 'tc-jump', `⤒<small>${label}</small>`);
  const active = new Set();
  const refresh = () => btn.classList.toggle('on', active.size > 0);

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try {
      btn.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is a nicety
    }
    active.add(e.pointerId);
    touchState[player].jumpQueued = true; // one jump per tap (tap twice = double jump)
    refresh();
  });
  const release = (e) => {
    active.delete(e.pointerId);
    refresh();
  };
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('lostpointercapture', release);
  btn._reset = () => {
    active.clear();
    refresh();
  };
  return btn;
}

let resetters = [];

// Lets the CSS move the canvas up when there is spare room below it (tablets),
// then asks Phaser to re-fit the canvas to its (resized) parent.
function setPlaying(playing) {
  if (document.body.classList.contains('touch-playing') === playing) return;
  document.body.classList.toggle('touch-playing', playing);
  window.dispatchEvent(new Event('resize'));
}

/**
 * Show the on-screen gamepad for a game.
 * @param {'1p'|'2p-coop'|'2p-versus'} mode
 * @param {{p1Name:string, p2Name:string}} names  names shown above each player's controls
 * @param {string} jumpLabel  small caption under the jump arrow ('SAUT')
 */
export function showTouchControls(mode, names, jumpLabel = 'SAUT') {
  const root = document.getElementById('touch-controls');
  if (!root) return;
  resetTouchState();
  root.innerHTML = '';
  resetters = [];

  if (!touchMode) {
    root.hidden = true;
    setPlaying(false);
    return;
  }

  if (mode === '1p') {
    // Classic layout: move with the left thumb, jump with the right thumb.
    const left = el('div', 'tc-cluster left');
    const pad = createDpad('p1');
    left.append(pad);
    const right = el('div', 'tc-cluster right');
    const jump = createJumpButton('p1', jumpLabel);
    right.append(jump);
    root.append(left, right);
    resetters.push(pad._reset, jump._reset);
  } else {
    // Two players on one tablet: player 2 holds the left side, player 1 the right side
    // (same as the keyboard: Z/Q/D on the left, arrows on the right).
    const build = (player, side, name) => {
      const cluster = el('div', `tc-cluster ${side} ${player}`);
      const tag = el('div', 'tc-tag');
      tag.textContent = name;
      const pad = createDpad(player);
      const jump = createJumpButton(player, jumpLabel);
      cluster.append(tag, pad, jump);
      resetters.push(pad._reset, jump._reset);
      return cluster;
    };
    root.append(build('p2', 'left', names.p2Name), build('p1', 'right', names.p1Name));
  }

  root.hidden = false;
  setPlaying(true);
}

export function hideTouchControls() {
  const root = document.getElementById('touch-controls');
  resetters.forEach((reset) => reset());
  resetters = [];
  resetTouchState();
  if (root) {
    root.hidden = true;
    root.innerHTML = '';
  }
  setPlaying(false);
}

// ---------------------------------------------------------------------------
// Fullscreen (Android / iPad / desktop — not available on iPhone Safari)
// ---------------------------------------------------------------------------

export function isFullscreenAvailable() {
  return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
}

export function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

export function toggleFullscreen() {
  if (isFullscreen()) {
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    return;
  }
  // Fullscreen the whole page (not just the canvas) so the on-screen gamepad stays visible.
  const target = document.documentElement;
  const request = target.requestFullscreen || target.webkitRequestFullscreen;
  if (!request) return;
  const result = request.call(target, { navigationUI: 'hide' });
  const lock = () => {
    try {
      screen.orientation?.lock?.('landscape')?.catch?.(() => {});
    } catch {
      // Orientation lock is not supported everywhere
    }
  };
  if (result && typeof result.then === 'function') result.then(lock).catch(() => {});
  else lock();
}

// ---------------------------------------------------------------------------
// "Rotate your phone" hint
// ---------------------------------------------------------------------------

let rotateDismissed = false;

function updateRotateHint() {
  const hint = document.getElementById('rotate-hint');
  if (!hint) return;
  const portrait = window.innerHeight > window.innerWidth;
  hint.hidden = !(touchMode && portrait && !rotateDismissed);
}

function localizeRotateHint() {
  const title = document.getElementById('rotate-title');
  const dismiss = document.getElementById('rotate-dismiss');
  if (title) title.textContent = t('rotateHint');
  if (dismiss) dismiss.textContent = t('rotateDismiss');
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export function initMobile() {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.toggle('touch', touchMode);

  // Switch to touch UI as soon as someone touches the screen.
  window.addEventListener('touchstart', enableTouchMode, { passive: true, capture: true });
  coarseQuery?.addEventListener?.('change', (e) => e.matches && enableTouchMode());

  // No long-press menu / magnifier on the game.
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  // iOS Safari: block pinch-zoom gestures (it ignores user-scalable=no).
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  localizeRotateHint();
  document.addEventListener('languagechange', localizeRotateHint);
  document.getElementById('rotate-dismiss')?.addEventListener('click', () => {
    rotateDismissed = true;
    updateRotateHint();
  });
  window.addEventListener('resize', updateRotateHint);
  window.addEventListener('orientationchange', updateRotateHint);
  updateRotateHint();

  // If the page goes to the background mid-press, don't leave a direction stuck.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetters.forEach((reset) => reset());
  });
}
