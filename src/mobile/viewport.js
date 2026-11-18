import Phaser from 'phaser';
import { getActivePlayersInfo, t } from '../i18n/i18n.js';
import { getControlStyle, onTouchModeChange, showTouchControls } from './touch-controls.js';

/**
 * On touch screens the canvas fills the whole screen (Phaser EXPAND mode), so the visible
 * area can be wider (phones) or taller (tablets) than the 960×540 layout. Menu and victory
 * screens keep their layout, centered (their backgrounds extend beyond 960×540).
 */
export function centerSceneCamera(scene) {
  const cam = scene.cameras.main;
  const apply = () => cam.centerOn(480, 270);
  apply();
  scene.scale.on('resize', apply);
  scene.events.once('shutdown', () => scene.scale.off('resize', apply));
}

/** Call once after creating the game. */
export function setupMobileGame(game) {
  if (typeof window === 'undefined') return;

  // Workaround for a Phaser 3.90 bug: on rotation, the ScaleManager refreshes *before*
  // reading the new parent size, then stores that size without refreshing again, so an
  // EXPAND game keeps its previous dimensions. Refresh once the new layout is in place.
  const relayout = () => {
    game.scale.getParentBounds();
    game.scale.refresh();
  };
  const scheduleRelayout = () => {
    requestAnimationFrame(relayout);
    setTimeout(relayout, 350);
  };
  window.addEventListener('resize', scheduleRelayout);
  window.addEventListener('orientationchange', scheduleRelayout);
  screen.orientation?.addEventListener?.('change', scheduleRelayout);

  // When a touchscreen is used for the first time (e.g. touchscreen laptop),
  // switch the current screen to its touch-friendly version.
  onTouchModeChange(() => {
    game.scale.scaleMode = Phaser.Scale.EXPAND;
    game.scale.refresh();
    for (const key of ['MenuScene', 'VictoryScene']) {
      if (game.scene.isActive(key)) game.scene.getScene(key).scene.restart();
    }
    if (game.scene.isActive('GameScene')) {
      const scene = game.scene.getScene('GameScene');
      scene._applyViewport();
      if (getControlStyle() === 'buttons') {
        showTouchControls(scene.gameMode, getActivePlayersInfo(), t('jumpBtn'));
      }
    }
  });
}
