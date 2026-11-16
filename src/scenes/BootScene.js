import Phaser from 'phaser';
import { generateAllSkinTextures } from '../skins/SkinsManager.js';

/**
 * Generates crisp, cute procedural textures for characters, skins, bricks, items, monsters, and particles.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const poses = ['front', 'right', 'left', 'walk', 'ouch'];
    for (const p of ['p1', 'p2']) {
      for (const pose of poses) {
        this.load.image(`${p}-${pose}`, `assets/characters/${p}-${pose}.png`);
      }
    }
  }

  create() {
    generateAllSkinTextures(this);
    this._createSlimeTexture();
    this._createMonsterTextures();
    this._createTrapTextures();
    this._createPickupTextures();
    this._createBubbleTextures();
    this._createParticleTexture();
    this._createTearTexture();

    this.scene.start('MenuScene');
  }

  _createMonsterTextures() {
    // 1. Crab ('crab') — Red/orange beach & desert crab with claws & stalk eyes
    const gc = this.make.graphics({ x: 0, y: 0, add: false });
    // Legs
    gc.lineStyle(3, 0xdc2626, 1);
    gc.strokeLineShape(new Phaser.Geom.Line(8, 24, 2, 31));
    gc.strokeLineShape(new Phaser.Geom.Line(13, 25, 7, 32));
    gc.strokeLineShape(new Phaser.Geom.Line(36, 24, 42, 31));
    gc.strokeLineShape(new Phaser.Geom.Line(31, 25, 37, 32));
    // Claws
    gc.fillStyle(0xef4444, 1);
    gc.fillCircle(6, 12, 5.5);
    gc.fillCircle(38, 12, 5.5);
    // Shell
    gc.fillStyle(0xf97316, 1);
    gc.fillEllipse(22, 20, 28, 17);
    // Eyes on stalks
    gc.fillStyle(0xffffff, 1);
    gc.fillCircle(16, 10, 4.2);
    gc.fillCircle(28, 10, 4.2);
    gc.fillStyle(0x0f172a, 1);
    gc.fillCircle(16, 10, 2.2);
    gc.fillCircle(28, 10, 2.2);
    gc.generateTexture('crab', 44, 34);
    gc.destroy();

    // 2. Bat ('bat') — Cute flying purple/pink cavern bat with wings
    const gb = this.make.graphics({ x: 0, y: 0, add: false });
    // Wings
    gb.fillStyle(0x4c1d95, 1);
    gb.fillTriangle(2, 8, 18, 14, 10, 26);
    gb.fillTriangle(46, 8, 30, 14, 38, 26);
    // Ears
    gb.fillStyle(0x6d28d9, 1);
    gb.fillTriangle(16, 10, 20, 2, 22, 10);
    gb.fillTriangle(26, 10, 28, 2, 32, 10);
    // Body
    gb.fillCircle(24, 18, 10);
    // Glowing yellow eyes & little fangs
    gb.fillStyle(0xfacc15, 1);
    gb.fillCircle(20, 17, 2.8);
    gb.fillCircle(28, 17, 2.8);
    gb.fillStyle(0xffffff, 1);
    gb.fillTriangle(21, 22, 23, 22, 22, 25);
    gb.fillTriangle(25, 22, 27, 22, 26, 25);
    gb.generateTexture('bat', 48, 32);
    gb.destroy();

    // 3. Frog ('frog') — Bouncy emerald frog with big eyes
    const gf = this.make.graphics({ x: 0, y: 0, add: false });
    gf.fillStyle(0x15803d, 1);
    gf.fillEllipse(8, 26, 10, 8);
    gf.fillEllipse(34, 26, 10, 8);
    gf.fillStyle(0x22c55e, 1);
    gf.fillEllipse(21, 21, 28, 18);
    gf.fillStyle(0xbbf7d0, 1);
    gf.fillEllipse(21, 23, 18, 10);
    // Big frog eyes
    gf.fillStyle(0x22c55e, 1);
    gf.fillCircle(14, 10, 6);
    gf.fillCircle(28, 10, 6);
    gf.fillStyle(0xffffff, 1);
    gf.fillCircle(14, 10, 4.2);
    gf.fillCircle(28, 10, 4.2);
    gf.fillStyle(0x0f172a, 1);
    gf.fillCircle(14, 10, 2.2);
    gf.fillCircle(28, 10, 2.2);
    gf.generateTexture('frog', 42, 32);
    gf.destroy();
  }

  _createTrapTextures() {
    // 1. Spikes ('trap-spikes') — 3 cute metallic/red warning spikes (48x20)
    const gs = this.make.graphics({ x: 0, y: 0, add: false });
    for (let i = 0; i < 3; i++) {
      const bx = i * 16;
      gs.fillStyle(0xe11d48, 1);
      gs.fillTriangle(bx + 1, 20, bx + 8, 2, bx + 15, 20);
      gs.fillStyle(0xfda4af, 0.85);
      gs.fillTriangle(bx + 4, 18, bx + 8, 5, bx + 9, 18);
    }
    gs.fillStyle(0x334155, 1);
    gs.fillRect(0, 17, 48, 3);
    gs.generateTexture('trap-spikes', 48, 20);
    gs.destroy();

    // 2. Pinball Bumper ('trap-bumper') — Bouncy neon ring (44x44)
    const gb = this.make.graphics({ x: 0, y: 0, add: false });
    gb.fillStyle(0xfacc15, 1);
    gb.fillCircle(22, 22, 20);
    gb.fillStyle(0xd946ef, 1);
    gb.fillCircle(22, 22, 15);
    gb.fillStyle(0xffffff, 0.9);
    gb.fillCircle(22, 22, 7);
    gb.generateTexture('trap-bumper', 44, 44);
    gb.destroy();

    // 3. Fireball ('trap-fireball') — Glowing magma/plasma orb (32x32)
    const gf = this.make.graphics({ x: 0, y: 0, add: false });
    gf.fillStyle(0xef4444, 0.85);
    gf.fillCircle(16, 16, 15);
    gf.fillStyle(0xf97316, 1);
    gf.fillCircle(16, 16, 11);
    gf.fillStyle(0xfef08a, 1);
    gf.fillCircle(16, 16, 6);
    gf.generateTexture('trap-fireball', 32, 32);
    gf.destroy();
  }

  _createSlimeTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Cute purple jelly slime body
    g.fillStyle(0xc084fc, 1);
    g.fillRoundedRect(2, 6, 36, 26, 13);

    g.fillStyle(0xa855f7, 1);
    g.fillRoundedRect(2, 22, 36, 10, 5);

    // Shine
    g.fillStyle(0xffffff, 0.4);
    g.fillEllipse(13, 13, 10, 5);

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(14, 19, 4.2);
    g.fillCircle(26, 19, 4.2);

    g.fillStyle(0x1e1b4b, 1);
    g.fillCircle(14, 19, 2.2);
    g.fillCircle(26, 19, 2.2);

    g.generateTexture('slime', 40, 32);
    g.destroy();
  }

  _createPickupTextures() {
    // 1. Unit Coin/Berry (1-9) - Golden yellow
    const g1 = this.make.graphics({ x: 0, y: 0, add: false });
    g1.fillStyle(0xf59e0b, 1);
    g1.fillCircle(20, 20, 18);
    g1.fillStyle(0xfde047, 1);
    g1.fillCircle(20, 20, 14);
    g1.fillStyle(0xffffff, 0.5);
    g1.fillEllipse(14, 13, 8, 4);
    g1.generateTexture('pickup-unit', 40, 40);
    g1.destroy();

    // 2. Tens Star Orb (10-99) - Cyan/Sky
    const g2 = this.make.graphics({ x: 0, y: 0, add: false });
    g2.fillStyle(0x0284c7, 1);
    g2.fillCircle(22, 22, 20);
    g2.fillStyle(0x38bdf8, 1);
    g2.fillCircle(22, 22, 16);
    g2.fillStyle(0xffffff, 0.55);
    g2.fillEllipse(16, 14, 9, 5);
    g2.generateTexture('pickup-ten', 44, 44);
    g2.destroy();

    // 3. Hundreds Mega Gem (100+) - Pink/Magenta
    const g3 = this.make.graphics({ x: 0, y: 0, add: false });
    g3.fillStyle(0xbe185d, 1);
    g3.fillRoundedRect(2, 2, 44, 44, 14);
    g3.fillStyle(0xf472b6, 1);
    g3.fillRoundedRect(6, 6, 36, 36, 11);
    g3.fillStyle(0xffffff, 0.6);
    g3.fillEllipse(17, 14, 10, 5);
    g3.generateTexture('pickup-hundred', 48, 48);
    g3.destroy();
  }

  _createBubbleTextures() {
    const bubbleStyles = [
      { key: 'bubble-+', fill: 0x22c55e, rim: 0x86efac },
      { key: 'bubble--', fill: 0x3b82f6, rim: 0x93c5fd },
      { key: 'bubble-×', fill: 0xf97316, rim: 0xfdba74 },
      { key: 'bubble-÷', fill: 0xa855f7, rim: 0xd8b4fe }
    ];

    bubbleStyles.forEach(({ key, fill, rim }) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Translucent soap bubble body
      g.fillStyle(fill, 0.85);
      g.fillCircle(24, 24, 21);
      // Glossy rim
      g.lineStyle(3, rim, 0.95);
      g.strokeCircle(24, 24, 21);
      // Bubble specular highlights
      g.fillStyle(0xffffff, 0.65);
      g.fillEllipse(16, 14, 10, 6);
      g.fillCircle(31, 31, 3);
      g.generateTexture(key, 48, 48);
      g.destroy();
    });
  }

  _createParticleTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(6, 6, 6);
    g.generateTexture('sparkle', 12, 12);
    g.destroy();
  }

  _createTearTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x38bdf8, 1);
    g.fillEllipse(7, 9, 10, 14);
    g.lineStyle(1.5, 0xffffff, 0.9);
    g.strokeEllipse(7, 9, 10, 14);
    g.generateTexture('tear', 14, 18);
    g.destroy();
  }
}
