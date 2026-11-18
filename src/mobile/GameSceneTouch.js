import Phaser from 'phaser';
import { soundFX } from '../audio/SoundEffects.js';
import { getActivePlayersInfo, t } from '../i18n/i18n.js';
import {
  ZOOM_LEVELS,
  cycleZoom,
  getControlStyle,
  getZoomFactor,
  getZoomIndex,
  hideTouchControls,
  isTouchMode,
  showTouchControls
} from './touch-controls.js';

/**
 * Phones & tablets support for GameScene, mixed into its prototype (end of GameScene.js):
 *
 *  - two cameras: the world (fills the screen, zoomable with the 🔍 button, follows the
 *    heroes) and the HUD (fixed, full width);
 *  - bigger HUD buttons on touch screens;
 *  - "touch the screen" controls: touch where the hero should go, swipe up to jump,
 *    touch a higher platform to climb onto it;
 *  - the on-screen gamepad (touch-controls.js) when chosen in the menu.
 */
export const GameSceneTouch = {
  // ---------------------------------------------------------------------------
  // Two cameras: the world (zoomable, follows the heroes) and the HUD (fixed).
  // HUD objects are created inside _withUi(); every object is seen by one camera only.
  // ---------------------------------------------------------------------------

  _initUiLayer() {
    this.uiCam = null;
    this._addingUi = false;
    const onAdded = (obj) => {
      if (this._addingUi) obj.__ui = true;
      if (this.uiCam) (obj.__ui ? this.cameras.main : this.uiCam).ignore(obj);
    };
    this.events.on('addedtoscene', onAdded);
    this.events.once('shutdown', () => this.events.off('addedtoscene', onAdded));
  },

  _withUi(fn) {
    const prev = this._addingUi;
    this._addingUi = true;
    try {
      return fn();
    } finally {
      this._addingUi = prev;
    }
  },

  _spawnUiFloatingText(...args) {
    return this._withUi(() => this._spawnFloatingText(...args));
  },

  /** End of create(): cameras, "touch the screen" input and on-screen gamepad. */
  _setupTouchPlay() {
    this._setupScreenTouch();
    this._setupCameras();
    if (isTouchMode() && getControlStyle() === 'buttons') {
      showTouchControls(this.gameMode, getActivePlayersInfo(), t('jumpBtn'));
    } else {
      hideTouchControls();
    }
    this.events.once('shutdown', hideTouchControls);
  },

  _setupCameras() {
    this.followTarget = this.add.zone(480, 270, 1, 1);
    this.uiCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.children.list.forEach((obj) => (obj.__ui ? this.cameras.main : this.uiCam).ignore(obj));
    this.scale.on('resize', this._applyViewport, this);
    this.events.once('shutdown', () => this.scale.off('resize', this._applyViewport, this));
    this._applyViewport();
  },

  // Fit the 960×540 level to the screen: fill the width on wide phones (cropping a bit of
  // height, the camera follows the heroes), show everything on taller screens, then apply
  // the player's extra zoom (🔍 button).
  _applyViewport() {
    if (!this.uiCam) return;
    const W = this.scale.width;
    const H = this.scale.height;
    const cam = this.cameras.main;
    const base = W / H >= 960 / 540 ? W / 960 : Math.min(W / 960, H / 540);
    cam.setZoom(base * getZoomFactor());
    if (W / cam.zoom >= 959.5 && H / cam.zoom >= 539.5) {
      cam.stopFollow();
      cam.removeBounds();
      cam.centerOn(480, 270);
    } else {
      cam.setBounds(0, 0, 960, 540);
      this._updateFollowTarget();
      cam.startFollow(this.followTarget, false, 0.12, 0.12);
    }
    // HUD: when the whole level is visible with free space above/below it (tablets),
    // put the HUD bar just above the level and the level caption just below it, so they
    // don't cover the playfield. Otherwise (phones, zoomed in) they overlay it.
    const band = Math.max(0, (H - 540 * cam.zoom) / 2);
    const hudTop = band >= 44 ? band - 44 : 0;
    this.uiCam.setSize(W, H);
    this.uiCam.setScroll(-(W - 960) / 2, -hudTop);
    this.hudStageText.setY((band >= 26 ? H - band + 14 : H - 12) - hudTop);
    this._layoutHudForTouch();
  },

  _updateFollowTarget() {
    if (!this.followTarget || !this.players) return;
    const active = this.players.filter((p) => !p.playerData.enteredDoor);
    if (!active.length) return;
    this.followTarget.setPosition(
      active.reduce((sum, p) => sum + p.x, 0) / active.length,
      active.reduce((sum, p) => sum + p.y, 0) / active.length
    );
  },

  // ---------------------------------------------------------------------------
  // HUD on touch screens
  // ---------------------------------------------------------------------------

  /** End of _createHud(): zoom button, layout, and an equation text that fits. */
  _finishTouchHud() {
    if (isTouchMode()) {
      this.hudZoomBtn = this.add.text(660, 12, this._zoomLabel(), {
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#fde047',
        backgroundColor: '#1e293b',
        padding: { x: 5, y: 3 }
      }).setInteractive({ useHandCursor: true });
      this.hudZoomBtn.on('pointerdown', () => {
        soundFX.playOperatorSwitch();
        cycleZoom();
        this.hudZoomBtn.setText(this._zoomLabel());
        this._applyViewport();
      });
    }
    this._layoutHudForTouch();
    this._fitHudEquationText();
  },

  _zoomLabel() {
    return getZoomIndex() < ZOOM_LEVELS.length - 1 ? '🔍+' : '🔍−';
  },

  // The HUD bar spans the full screen width (the UI camera keeps the 960-wide HUD layout
  // centered, so the screen's left/right edges are at L/R in HUD coordinates). On touch
  // screens: bigger buttons (with an even bigger hit area), packed from the right edge.
  _layoutHudForTouch() {
    const W = this.scale.width;
    const L = -(W - 960) / 2;
    const R = 960 - L;
    this.hudBar.clear().fillStyle(0x0f172a, 0.82).fillRect(L, 0, W, 44);
    this.hudCounterText.setX(L + 16);
    if (!isTouchMode()) return;
    const buttons = [
      this.hudZoomBtn,
      this.hudUndoBtn,
      this.hudMuteBtn,
      this.hudLangBtn,
      this.hudRestartBtn,
      this.hudMenuBtn
    ].filter(Boolean);
    let x = R - 6;
    for (let i = buttons.length - 1; i >= 0; i--) {
      const btn = buttons[i];
      btn.setFontSize(19);
      btn.setPadding(10, 6, 10, 6);
      btn.setOrigin(0, 0);
      x -= btn.width;
      btn.setPosition(x, 2);
      // Enlarge the hit area (half the gap on each side + a bit below the HUD bar).
      btn.input.hitArea.setTo(-4, -2, btn.width + 8, btn.height + 10);
      x -= 8;
    }
    this.hudEquationText.setX(x - 4).setY(12);
    this.hudEquationText.setText(this.hudEquationText.text);
  },

  // Keep the equation / hint text between the counter (left) and the buttons (right).
  _fitHudEquationText() {
    const eq = this.hudEquationText;
    const counter = this.hudCounterText;
    const setText = eq.setText.bind(eq);
    eq.setText = (value) => {
      eq.setScale(1);
      setText(value);
      const room = eq.x - (counter.x + counter.width) - 14;
      if (eq.width > room) eq.setScale(Math.max(0.5, room / eq.width));
      return eq;
    };
    eq.setText(eq.text);
  },

  // ---------------------------------------------------------------------------
  // "Touch the screen" controls
  //  - touch where the hero should go: he runs there (and follows a held finger);
  //  - swipe up anywhere = jump, keep sliding up = double jump;
  //  - touch a platform higher than the hero = he climbs onto it by himself: platforms
  //    are solid from below, so he first steps out from under it, jumps beside it,
  //    double-jumps if needed, and only moves over it once he is higher than it;
  //  - touch the sky above the hero = jump (double jump at the top if still lower).
  // In 2-player modes, each touch drives the hero closest to where it starts.
  // ---------------------------------------------------------------------------

  _setupScreenTouch() {
    const colors = this.gameMode === '1p' ? [0xfde047] : [0x93c5fd, 0xf9a8d4];
    this.players.forEach((player, i) => {
      player.playerData.touch = null;
      player.playerData.touchJumpQueued = false;
      player.playerData.touchMarker = this.add.graphics().setDepth(150);
      player.playerData.touchColor = colors[i] ?? colors[0];
    });
    const onDown = (pointer, over) => this._onScreenTouchDown(pointer, over);
    this.input.on('pointerdown', onDown);
    this.events.once('shutdown', () => this.input.off('pointerdown', onDown));
  },

  _onScreenTouchDown(pointer, over) {
    if (
      this.levelCompleted ||
      !pointer.wasTouch ||
      !isTouchMode() ||
      getControlStyle() !== 'screen' ||
      (over && over.length) || // a HUD button
      (this.uiCam && pointer.y + this.uiCam.scrollY < 48) // the HUD bar
    ) {
      return;
    }
    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const candidates = this.players.filter((p) => !p.playerData.enteredDoor);
    if (!candidates.length) return;
    const dist = (p) => Math.hypot(p.x - wp.x, p.y - wp.y);
    const hero =
      this.gameMode === '1p'
        ? this.players[0]
        : candidates.reduce((a, b) => (dist(a) <= dist(b) ? a : b));
    if (hero.playerData.enteredDoor) return;
    hero.playerData.touch = {
      pointer,
      identifier: pointer.identifier,
      x: Phaser.Math.Clamp(wp.x, 0, 960),
      y: wp.y,
      lastX: hero.x,
      lastMoveAt: this.time.now,
      swipeFromY: pointer.y, // lowest finger position since the last swipe-jump (canvas px)
      swiped: false, // after a swipe, no automatic jumps for this touch
      autoJumps: 0,
      nextAutoJumpAt: 0,
      doubleDone: false
    };
  },

  /** Called for each hero every frame: returns { left, right, jump } or null. */
  _touchMove(player, now) {
    const pData = player.playerData;
    const body = player.body;
    let jump = !!pData.touchJumpQueued;
    pData.touchJumpQueued = false;
    const touch = pData.touch;
    if (!touch) {
      pData.touchMarker.clear();
      return jump ? { left: false, right: false, jump } : null;
    }
    const held = touch.pointer.isDown && touch.pointer.identifier === touch.identifier;
    const grounded = body.blocked.down || body.touching.down;

    if (held) {
      // Swipe up ≈ 30 CSS pixels, whatever the screen = jump
      const py = touch.pointer.y;
      const swipe = 30 * this.scale.displayScale.y;
      if (py > touch.swipeFromY) {
        touch.swipeFromY = py;
      } else if (touch.swipeFromY - py >= swipe) {
        jump = true;
        touch.swiped = true;
        touch.swipeFromY = py;
      }
      const wp = this.cameras.main.getWorldPoint(touch.pointer.x, touch.pointer.y);
      touch.x = Phaser.Math.Clamp(wp.x, 0, 960);
      if (!touch.swiped) touch.y = wp.y;
    }

    const above = !touch.swiped && touch.y < body.top - 10;
    const canAuto = above && (held || touch.autoJumps < 3);
    const platform = canAuto ? this._platformUnder(touch.x, touch.y, body.bottom - 8) : null;
    const autoJump = () => {
      jump = true;
      touch.autoJumps += 1;
      touch.nextAutoJumpAt = now + 450;
      touch.doubleDone = false;
    };
    const doubleJump = () => {
      if (!touch.doubleDone && pData.jumpsUsed < 2 && body.velocity.y > -60) {
        jump = true;
        touch.doubleDone = true;
      }
    };

    let goal = touch.x;
    let precise = false;
    if (platform) {
      if (grounded) {
        // Walk to a take-off spot beside the platform, then jump
        const takeoff = (touch.takeoff = this._takeoffFor(player, platform));
        if (takeoff != null) {
          const inWindow =
            takeoff < platform.left
              ? player.x >= takeoff - 20 && player.x <= takeoff + 4
              : player.x <= takeoff + 20 && player.x >= takeoff - 4;
          goal = takeoff;
          precise = true;
          if (inWindow && now >= touch.nextAutoJumpAt) autoJump();
        } else if (Math.abs(touch.x - player.x) < 170 && now >= touch.nextAutoJumpAt) {
          autoJump(); // no clean spot: just try
        }
      } else if (body.bottom > platform.top + 2) {
        // In the air: stay beside the platform until higher than it, double-jump at the top
        if (touch.takeoff != null) goal = touch.takeoff;
        doubleJump();
      }
    } else if (canAuto) {
      if (grounded) {
        if (Math.abs(touch.x - player.x) < 170 && now >= touch.nextAutoJumpAt) autoJump();
      } else if (touch.y < body.bottom - 24) {
        doubleJump();
      }
    }

    // Dead zone ≈ the distance the hero slides when stopping (no left/right wobble),
    // except when walking to a take-off spot, which must be reached precisely.
    const dx = goal - player.x;
    const moving = Math.abs(dx) > (precise ? 2 : 20);
    const left = moving && dx < 0;
    const right = moving && dx > 0;

    // Finger lifted and hero at the spot: done, unless a jump toward it is under way.
    if (
      !held &&
      Math.abs(touch.x - player.x) <= 20 &&
      (!above || (grounded && touch.autoJumps > 0 && now >= touch.nextAutoJumpAt))
    ) {
      pData.touch = null;
    }
    // After the finger is lifted, give up if the hero is stuck (e.g. against a wall).
    if (!held && pData.touch) {
      if (Math.abs(player.x - touch.lastX) > 0.5 || !grounded) {
        touch.lastX = player.x;
        touch.lastMoveAt = now;
      } else if (now - touch.lastMoveAt > 350) {
        pData.touch = null;
      }
    }

    // Marker: where the hero is heading
    const marker = pData.touchMarker;
    marker.clear();
    if (pData.touch) {
      marker.lineStyle(4, pData.touchColor, held ? 0.95 : 0.6);
      marker.strokeCircle(touch.x, touch.y, 15);
      marker.fillStyle(pData.touchColor, held ? 0.6 : 0.35);
      marker.fillCircle(touch.x, touch.y, 5);
    }
    return { left, right, jump };
  },

  // Where to jump from to land on platform P: beside it (platforms and bricks are solid
  // from below), with nothing overhead up to the height of P, and on the surface the hero
  // stands on (so he doesn't walk off it). Returns the closest such x, or null.
  _takeoffFor(player, P) {
    const body = player.body;
    const half = body.width / 2;
    const head = body.top;
    const feet = body.bottom;
    const plats = this.platforms.getChildren().map((o) => o.body);
    const solids = [...plats, ...this.bricksGroup.getChildren().map((o) => o.body)];
    const support = plats.find(
      (b) => Math.abs(b.top - feet) <= 3 && body.right > b.left && body.left < b.right
    );
    if (!support) return null;
    // [x - 20 .. x + 4] (or mirrored) is where the jump may start: check that whole column
    const clear = (x, dir) => {
      const l = x - half - 4 - (dir < 0 ? 20 : 4);
      const r = x + half + 4 + (dir < 0 ? 4 : 20);
      return solids.every(
        (b) => b.right <= l || b.left >= r || b.bottom <= P.top - 64 || b.bottom > head + 2
      );
    };
    const onSupport = (x) =>
      x + half - 6 > support.left && x - half + 6 < support.right && x >= half && x <= 960 - half;
    let best = null;
    for (const [x0, dir] of [
      [P.left - half - 10, -1],
      [P.right + half + 10, 1]
    ]) {
      for (let i = 0; i <= 20; i++) {
        const x = x0 + dir * i * 6;
        if (!onSupport(x)) break;
        if (clear(x, dir)) {
          if (best == null || Math.abs(x - player.x) < Math.abs(best - player.x)) best = x;
          break;
        }
      }
    }
    return best;
  },

  // The platform the player touched (its surface is at or a bit below the finger),
  // ignoring platforms that are not higher than `maxTop` (the hero's feet).
  _platformUnder(x, y, maxTop) {
    let best = null;
    for (const p of this.platforms.getChildren()) {
      const b = p.body;
      const dy = b.top - y;
      if (x < b.left - 10 || x > b.right + 10 || dy < -30 || dy > 90 || b.top >= maxTop) continue;
      if (best && Math.abs(dy) >= Math.abs(best.top - y)) continue;
      best = { left: b.left, right: b.right, top: b.top };
    }
    return best;
  }
};
