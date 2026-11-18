import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { initMobile, isTouchMode } from './mobile/touch-controls.js';
import { setupMobileGame } from './mobile/viewport.js';

initMobile();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 540,
  backgroundColor: '#0f172a',
  scale: {
    // Touch screens: fill the whole screen (no black bars). Desktop: unchanged.
    mode: isTouchMode() ? Phaser.Scale.EXPAND : Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // Up to 3 fingers at once (2 players), and touches anywhere on the page count.
  input: {
    activePointers: 3,
    touch: { target: typeof document !== 'undefined' ? document.getElementById('game-container') : null }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 920 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene, VictoryScene]
};

export const game = new Phaser.Game(config);
if (typeof window !== 'undefined') {
  window.__GAME__ = game;
  setupMobileGame(game);
  // Fork: no analytics. The original sends level events to the author's Google Analytics
  // (with a consent dialog); this copy tracks nothing (trackLevelEvent() stays a no-op).
}
