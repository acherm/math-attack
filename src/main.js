import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { initAnalytics } from './analytics/analytics.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 540,
  backgroundColor: '#0f172a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
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
  initAnalytics();
}
