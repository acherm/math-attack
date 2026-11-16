import Phaser from 'phaser';
import { MathCounter, OPERATORS, formatThreeDigits, parseBubbleSpec } from '../math/MathEngine.js';
import { getLevelConfig } from '../levels/levels.js';
import { soundFX } from '../audio/SoundEffects.js';
import {
  getLang,
  toggleLang,
  getActivePlayersInfo,
  t,
  getLocalizedLevelText
} from '../i18n/i18n.js';
import { getSkinTextureKey } from '../skins/SkinsManager.js';
import { trackLevelEvent } from '../analytics/analytics.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.gameMode = data?.mode || '1p'; // '1p' | '2p-coop' | '2p-versus'
    this.levelNumber = data?.level || 1;
    this.levelConfig = getLevelConfig(this.levelNumber);
    this.levelCompleted = false;
    this.startTimeMs = 0;
    this.victoryTimer = null;
  }

  create() {
    if (this.scene.isActive('MenuScene')) this.scene.stop('MenuScene');
    if (this.scene.isActive('VictoryScene')) this.scene.stop('VictoryScene');
    soundFX.startMusic('game');
    this.startTimeMs = this.time.now;
    this._setupMathCounters();
    this._drawBackground();
    this._createPlatforms();
    this._createTopDoor();
    this._createBricks();
    this._createPickups();
    this._createSlimes();
    this._createTraps();
    this._createPlayers();
    this._createHud();
    this._setupControls();
    this._setupCollisions();

    this._updateAllVisuals();
    trackLevelEvent('level_start', this);
  }

  _restartLevel() {
    if (!this.levelCompleted) trackLevelEvent('level_restart', this);
    this.victoryTimer?.remove(false);
    this.scene.restart({ mode: this.gameMode, level: this.levelNumber });
  }

  _exitToMenu() {
    if (!this.levelCompleted) trackLevelEvent('level_exit', this);
    this.victoryTimer?.remove(false);
    this.scene.start('MenuScene');
  }

  _setupMathCounters() {
    const { startValue, targetValue, initialOperator } = this.levelConfig;
    if (this.gameMode === '2p-versus') {
      this.counterP1 = new MathCounter({ startValue, targetValue, initialOperator });
      this.counterP2 = new MathCounter({ startValue, targetValue, initialOperator });
    } else {
      // 1P and 2P Co-op share counterP1 as the main/team counter
      this.counterP1 = new MathCounter({ startValue, targetValue, initialOperator });
      this.counterP2 = this.counterP1;
    }
    this.wasDoorUnlocked = false;
  }

  _drawBackground() {
    const { skyTop, skyBottom, hillColor, decor = 'meadow' } = this.levelConfig;
    const bg = this.add.graphics();
    bg.fillGradientStyle(skyTop, skyTop, skyBottom, skyBottom, 1);
    bg.fillRect(0, 0, 960, 540);

    if (decor === 'meadow') {
      // Radiant sun + clouds + rolling hills + wildflowers
      bg.fillStyle(0xfde047, 0.9);
      bg.fillCircle(120, 95, 38);
      bg.fillStyle(0xfef08a, 0.35);
      bg.fillCircle(120, 95, 54);
      this._drawClouds(bg, 0xffffff, 0.45);
      bg.fillStyle(hillColor, 0.35);
      bg.fillEllipse(200, 510, 440, 150);
      bg.fillEllipse(760, 510, 480, 165);
      bg.fillEllipse(480, 520, 380, 120);
      [110, 260, 410, 620, 830].forEach((fx) => {
        bg.fillStyle(0xf43f5e, 0.8);
        bg.fillCircle(fx, 490, 5);
        bg.fillStyle(0xfef08a, 1);
        bg.fillCircle(fx, 490, 2.2);
      });
    } else if (decor === 'beach') {
      // Sun + turquoise ocean band + sand dunes + palm trees
      bg.fillStyle(0xfacc15, 0.9);
      bg.fillCircle(840, 90, 40);
      this._drawClouds(bg, 0xffffff, 0.4);
      bg.fillStyle(0x0284c7, 0.45);
      bg.fillRect(0, 435, 960, 75);
      bg.fillStyle(0xfde047, 0.45);
      bg.fillEllipse(240, 515, 480, 115);
      bg.fillEllipse(740, 515, 480, 115);
      // Palm trees at x=90 and x=870
      [90, 870].forEach((px) => {
        bg.fillStyle(0x92400e, 0.75);
        bg.fillRect(px - 6, 375, 12, 125);
        bg.fillStyle(0x16a34a, 0.8);
        bg.fillEllipse(px - 28, 375, 52, 18);
        bg.fillEllipse(px + 28, 375, 52, 18);
        bg.fillEllipse(px, 362, 48, 16);
      });
    } else if (decor === 'cavern') {
      // Stalactites on ceiling + glowing crystals at base
      bg.fillStyle(0x312e81, 0.65);
      for (let x = 40; x < 940; x += 90) {
        const h = 45 + ((x * 17) % 45);
        bg.fillTriangle(x - 28, 44, x + 28, 44, x, 44 + h);
      }
      // Glowing cyan & magenta crystals
      [130, 350, 590, 830].forEach((cx, i) => {
        bg.fillStyle(i % 2 === 0 ? 0x38bdf8 : 0xe879f9, 0.45);
        bg.fillTriangle(cx - 16, 500, cx + 16, 500, cx, 435);
        bg.fillTriangle(cx + 8, 500, cx + 30, 500, cx + 22, 455);
      });
    } else if (decor === 'desert') {
      // Sunset pyramids + saguaro cacti
      bg.fillStyle(0xfef08a, 0.8);
      bg.fillCircle(480, 110, 48);
      bg.fillStyle(0xd97706, 0.45);
      bg.fillTriangle(80, 500, 380, 500, 230, 310);
      bg.fillTriangle(540, 500, 880, 500, 710, 290);
      // Cacti
      [120, 430, 850].forEach((cx) => {
        bg.fillStyle(0x15803d, 0.75);
        bg.fillRoundedRect(cx - 7, 420, 14, 80, 6);
        bg.fillRoundedRect(cx - 22, 445, 16, 8, 4);
        bg.fillRoundedRect(cx - 22, 430, 8, 20, 4);
        bg.fillRoundedRect(cx + 6, 452, 16, 8, 4);
        bg.fillRoundedRect(cx + 14, 435, 8, 22, 4);
      });
    } else if (decor === 'snow') {
      // Snowy mountain peaks + pine trees + snowflakes
      bg.fillStyle(0x64748b, 0.45);
      bg.fillTriangle(40, 500, 420, 500, 230, 240);
      bg.fillTriangle(480, 500, 920, 500, 700, 220);
      bg.fillStyle(0xffffff, 0.75);
      bg.fillTriangle(172, 320, 288, 320, 230, 240);
      bg.fillTriangle(635, 305, 765, 305, 700, 220);
      // Snowflakes
      for (let i = 0; i < 28; i++) {
        bg.fillCircle((i * 97) % 940 + 10, (i * 61) % 440 + 50, 3);
      }
    } else if (decor === 'forest') {
      // Giant tree trunks + canopy + glowing fireflies
      bg.fillStyle(0x3f2e21, 0.4);
      [110, 380, 650, 880].forEach((tx) => {
        bg.fillRect(tx - 24, 44, 48, 460);
      });
      bg.fillStyle(0x047857, 0.45);
      bg.fillEllipse(240, 80, 380, 90);
      bg.fillEllipse(720, 80, 420, 90);
      // Glowing fireflies
      bg.fillStyle(0xfef08a, 0.8);
      for (let i = 0; i < 18; i++) {
        bg.fillCircle((i * 131) % 900 + 30, (i * 79) % 380 + 80, 3.5);
      }
    } else if (decor === 'volcano') {
      // Smoking volcano + glowing lava river at bottom
      bg.fillStyle(0x1e293b, 0.65);
      bg.fillTriangle(220, 500, 740, 500, 480, 190);
      bg.fillStyle(0xef4444, 0.65);
      bg.fillEllipse(480, 205, 70, 22);
      bg.fillRect(0, 482, 960, 22);
      bg.fillStyle(0xfacc15, 0.7);
      for (let i = 0; i < 16; i++) {
        bg.fillCircle((i * 113) % 920 + 20, (i * 67) % 400 + 70, 3);
      }
    } else {
      // Space galaxy: stars + ringed planet + crescent moon
      bg.fillStyle(0xffffff, 0.85);
      for (let i = 0; i < 40; i++) {
        bg.fillCircle((i * 89) % 940 + 10, (i * 53) % 440 + 48, (i % 3) + 1.2);
      }
      // Ringed planet
      bg.fillStyle(0xec4899, 0.55);
      bg.fillCircle(170, 125, 36);
      bg.lineStyle(5, 0xfef08a, 0.65);
      bg.strokeEllipse(170, 125, 110, 24);
      // Moon
      bg.fillStyle(0x38bdf8, 0.45);
      bg.fillCircle(810, 115, 30);
    }
  }

  _drawClouds(bg, color, alpha) {
    bg.fillStyle(color, alpha);
    const clouds = [
      { x: 240, y: 95, r: 26 },
      { x: 540, y: 72, r: 24 },
      { x: 790, y: 105, r: 28 }
    ];
    clouds.forEach((c) => {
      bg.fillCircle(c.x - c.r * 0.7, c.y + 4, c.r * 0.75);
      bg.fillCircle(c.x, c.y, c.r);
      bg.fillCircle(c.x + c.r * 0.7, c.y + 4, c.r * 0.75);
    });
  }

  _createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    // Ground floor (960 x 44 at y = 518)
    this._addPlatformBar(480, 518, 960, 44, true);

    // Tiered platforms
    this.levelConfig.platforms.forEach((p) => {
      this._addPlatformBar(p.x, p.y, p.width, 22, false);
    });
  }

  _addPlatformBar(x, y, width, height, isGround) {
    const baseCol = this.levelConfig.platColor ?? 0x92400e;
    const topCol = this.levelConfig.platTopColor ?? 0x22c55e;
    const key = `plat-${width}-${height}-${baseCol}-${topCol}-${isGround ? 'g' : 'p'}`;
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(baseCol, 1);
      g.fillRoundedRect(0, 0, width, height, isGround ? 0 : 10);
      g.fillStyle(topCol, 1);
      g.fillRoundedRect(0, 0, width, Math.min(10, height * 0.45), isGround ? 0 : 8);
      g.fillStyle(0xffffff, 0.35);
      g.fillRect(8, 2, width - 16, 3);
      g.generateTexture(key, width, height);
      g.destroy();
    }

    const plat = this.platforms.create(x, y, key);
    plat.refreshBody();
    return plat;
  }

  _createTopDoor() {
    const { doorX, doorY, targetValue } = this.levelConfig;
    const formattedTarget = formatThreeDigits(targetValue);

    this.doorContainer = this.add.container(doorX, doorY);

    // Door frame graphic
    this.doorGraphic = this.add.graphics();
    this.doorContainer.add(this.doorGraphic);

    // Number sign board above door
    const signBg = this.add.graphics();
    signBg.fillStyle(0x0f172a, 0.95);
    signBg.lineStyle(3, 0xfacc15, 1);
    signBg.fillRoundedRect(-62, -58, 124, 34, 9);
    signBg.strokeRoundedRect(-62, -58, 124, 34, 9);
    this.doorContainer.add(signBg);

    // Place-value color-coded digits on the door sign (Hundreds=Pink, Tens=Sky, Ones=Yellow)
    const dHundreds = this.add.text(-32, -41, String(formattedTarget.hundreds), {
      fontSize: '23px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f472b6'
    }).setOrigin(0.5);

    const dTens = this.add.text(0, -41, String(formattedTarget.tens), {
      fontSize: '23px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5);

    const dOnes = this.add.text(32, -41, String(formattedTarget.ones), {
      fontSize: '23px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#fde047'
    }).setOrigin(0.5);

    this.doorStatusText = this.add.text(0, 6, 'LOCKED', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#fda4af'
    }).setOrigin(0.5);

    this.doorContainer.add([dHundreds, dTens, dOnes, this.doorStatusText]);

    // Invisible physics sensor zone for the door
    this.doorZone = this.add.zone(doorX, doorY, 64, 56);
    this.physics.world.enable(this.doorZone, Phaser.Physics.Arcade.STATIC_BODY);

    this._renderDoorState(false);
  }

  _renderDoorState(isOpen) {
    this.doorGraphic.clear();
    if (isOpen) {
      // Golden glowing open portal
      this.doorGraphic.fillStyle(0xfacc15, 0.3);
      this.doorGraphic.fillCircle(0, 0, 44);
      this.doorGraphic.fillStyle(0xf59e0b, 1);
      this.doorGraphic.fillRoundedRect(-32, -24, 64, 52, 14);
      this.doorGraphic.fillStyle(0x34d399, 1);
      this.doorGraphic.fillRoundedRect(-24, -18, 48, 46, 10);
      this.doorStatusText.setText(t('doorOpen'));
      this.doorStatusText.setColor('#064e3b');
    } else {
      // Locked sturdy wooden/iron door
      this.doorGraphic.fillStyle(0x475569, 1);
      this.doorGraphic.fillRoundedRect(-32, -24, 64, 52, 14);
      this.doorGraphic.fillStyle(0x1e293b, 1);
      this.doorGraphic.fillRoundedRect(-24, -18, 48, 46, 10);
      this.doorStatusText.setText(t('doorLocked'));
      this.doorStatusText.setColor('#fda4af');
    }
  }

  _createBricks() {
    this.bricksGroup = this.physics.add.staticGroup();
    this.brickObjects = [];

    const brickDefs = [...this.levelConfig.bricks];
    brickDefs.forEach((b) => {
      const brick = this._createSingleBrick(b.x, b.y, b.type, b.caption);
      this.brickObjects.push(brick);
    });
  }

  _getBrickStyle(type) {
    if (OPERATORS[type]) {
      return { bg: OPERATORS[type].color, border: 0xffffff, label: type };
    }
    switch (type) {
      case '×2':
      case '×3':
        return { bg: 0xf97316, border: 0xfed7aa, label: type };
      case '×10':
        return { bg: 0x0d9488, border: 0x99f6e4, label: '×10' };
      case '÷10':
        return { bg: 0x0891b2, border: 0xa5f3fc, label: '÷10' };
      case '+1':
        return { bg: 0x16a34a, border: 0xbbf7d0, label: '+1' };
      case '-1':
        return { bg: 0x2563eb, border: 0xbfdbfe, label: '-1' };
      case 'undo':
        return { bg: 0x64748b, border: 0xe2e8f0, label: '⏪' };
      case 'reset':
        return { bg: 0xe11d48, border: 0xfecdd3, label: '000' };
      case 'swap':
        return { bg: 0xd946ef, border: 0xf5d0fe, label: '⇄' };
      case 'mystery':
      default:
        return { bg: 0xeab308, border: 0xfef08a, label: '?' };
    }
  }

  _createSingleBrick(x, y, type, caption = '') {
    const style = this._getBrickStyle(type);
    const texKey = `brick-tex-${type}`;

    if (!this.textures.exists(texKey)) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(style.bg, 1);
      g.fillRoundedRect(0, 0, 50, 44, 10);
      g.lineStyle(3, style.border, 0.95);
      g.strokeRoundedRect(2, 2, 46, 40, 9);

      // Cute corner rivets
      g.fillStyle(0xffffff, 0.65);
      g.fillCircle(7, 7, 2);
      g.fillCircle(43, 7, 2);
      g.fillCircle(7, 37, 2);
      g.fillCircle(43, 37, 2);

      g.generateTexture(texKey, 50, 44);
      g.destroy();
    }

    const sprite = this.bricksGroup.create(x, y, texKey);
    sprite.refreshBody();

    const labelText = this.add.text(x, y - (caption ? 4 : 0), style.label, {
      fontSize: style.label.length > 2 ? '15px' : '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 4
    }).setOrigin(0.5);

    let subCaption = null;
    if (caption) {
      const localizedCap = this._getLocalizedBrickCaption(type, caption);
      subCaption = this.add.text(x, y + 12, localizedCap, {
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#fef08a',
        stroke: '#0f172a',
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    sprite.brickData = {
      type,
      caption,
      baseX: x,
      baseY: y,
      labelText,
      subCaption,
      lastBumpAt: 0
    };

    return sprite;
  }

  _getLocalizedBrickCaption(type, fallbackCaption = '') {
    const isFr = getLang() === 'fr';
    if (type === 'mystery') return isFr ? 'AIDE' : 'HELP';
    if (type === 'undo') return isFr ? 'RETOUR' : 'UNDO';
    if (type === 'reset') return isFr ? 'ZÉRO' : '000';
    return fallbackCaption;
  }

  _createPickups() {
    this.pickupsGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    const bubbles = this.levelConfig.initialBubbles || [];
    bubbles.forEach((b) => {
      this._spawnPickup(b.x, b.y, b.bubble, true);
    });
  }

  _spawnPickup(x, y, bubbleSpec, shouldRespawn = true) {
    const parsed = parseBubbleSpec(bubbleSpec, '+');
    const texKey = this.textures.exists(`bubble-${parsed.op}`) ? `bubble-${parsed.op}` : 'bubble-+';
    const pickup = this.pickupsGroup.create(x, y, texKey);
    pickup.setCircle(21, 3, 3);

    // Divisibility sparkle halo (visible when bubble is ÷ and evenly divides current number)
    const halo = this.add.graphics();
    halo.lineStyle(3.5, 0x4ade80, 0.95);
    halo.strokeCircle(0, 0, 25);
    halo.setPosition(x, y);
    halo.setVisible(false);

    const text = this.add.text(x, y, parsed.label, {
      fontSize: parsed.label.length >= 4 ? '14px' : '17px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Gentle floating bubble bob animation
    const floatTween = this.tweens.add({
      targets: [pickup, text, halo],
      y: y - 8,
      duration: 950 + (x % 300),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    pickup.pickupData = {
      bubbleSpec: parsed,
      op: parsed.op,
      value: parsed.value,
      label: parsed.label,
      spawnX: x,
      spawnY: y,
      shouldRespawn,
      text,
      halo,
      floatTween,
      lastRejectAt: 0
    };

    return pickup;
  }

  _createSlimes() {
    this.slimesGroup = this.physics.add.group();

    this.levelConfig.slimes.forEach((s) => {
      this._spawnSlime(s);
    });
  }

  _spawnSlime(slimeConfig) {
    const kind = slimeConfig.kind || 'slime';
    const penalty = slimeConfig.penalty || 1;
    const texKey = this.textures.exists(kind) ? kind : 'slime';
    const slime = this.slimesGroup.create(slimeConfig.x, slimeConfig.y, texKey);
    slime.setCollideWorldBounds(true);

    if (kind === 'bat') {
      slime.body.setAllowGravity(false);
    } else {
      slime.setBounce(0.2);
    }
    slime.setVelocityX(slimeConfig.speed);

    const badge = this.add.text(slimeConfig.x, slimeConfig.y - 22, `-${penalty}`, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fda4af',
      stroke: '#0f172a',
      strokeThickness: 3.5
    }).setOrigin(0.5);

    slime.slimeData = {
      ...slimeConfig,
      kind,
      penalty,
      flyY: slimeConfig.flyY ?? slimeConfig.y,
      nextHopAt: 0,
      badge
    };
    return slime;
  }

  _createTraps() {
    this.spikesGroup = this.physics.add.staticGroup();
    this.fireballsGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    const traps = this.levelConfig.traps || [];
    traps.forEach((tr) => {
      if (tr.type === 'spikes') {
        const sp = this.spikesGroup.create(tr.x, tr.y, 'trap-spikes');
        sp.refreshBody();
        sp.trapData = { penalty: tr.penalty || 2 };
      } else if (tr.type === 'fireball') {
        const fb = this.fireballsGroup.create(tr.x, tr.y, 'trap-fireball');
        fb.setCircle(14, 2, 2);
        fb.setVelocityY(-(tr.speedY || 110));
        fb.trapData = {
          minY: tr.minY ?? 180,
          maxY: tr.maxY ?? 465,
          speedY: tr.speedY || 110,
          penalty: tr.penalty || 3
        };
      }
    });
  }

  _createPlayers() {
    this.players = [];
    const playersInfo = getActivePlayersInfo();

    const p1 = this._createSinglePlayer({
      id: 1,
      name: playersInfo.p1Name,
      prefix: playersInfo.p1Prefix,
      x: this.gameMode === '1p' ? 430 : 350,
      y: 452,
      counter: this.counterP1
    });
    this.players.push(p1);

    if (this.gameMode !== '1p') {
      const p2 = this._createSinglePlayer({
        id: 2,
        name: playersInfo.p2Name,
        prefix: playersInfo.p2Prefix,
        x: 610,
        y: 452,
        counter: this.counterP2
      });
      this.players.push(p2);
    }
  }

  _createSinglePlayer({ id, name, prefix, x, y, counter }) {
    const sprite = this.physics.add.sprite(x, y, getSkinTextureKey(prefix, 'front'));
    sprite.setScale(0.42);
    sprite.setCollideWorldBounds(true);
    // Physics body in unscaled texture coordinates (140x170 -> 72x142 body)
    sprite.body.setSize(72, 142);
    sprite.body.setOffset(34, 22);

    // Floating overhead badge showing [Current Number]
    const badgeContainer = this.add.container(x, y - 46);
    const badgeBg = this.add.graphics();
    const badgeText = this.add.text(0, 0, '000', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    badgeContainer.add([badgeBg, badgeText]);

    sprite.playerData = {
      id,
      name,
      prefix,
      counter,
      badgeContainer,
      badgeBg,
      badgeText,
      coyoteUntil: 0,
      invulnerableUntil: 0,
      cryingUntil: 0,
      cryTween: null,
      jumpsUsed: 0,
      facing: 'front',
      enteredDoor: false
    };

    return sprite;
  }

  _createHud() {
    // Top translucent bar
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0f172a, 0.82);
    topBar.fillRect(0, 0, 960, 44);

    // Left: Player/Team counter display
    this.hudCounterText = this.add.text(16, 11, '', {
      fontSize: '17px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    });

    // Bottom: Stage title & subtitle
    const loc = getLocalizedLevelText(this.levelNumber, this.levelConfig.targetValue);
    this.hudStageText = this.add.text(480, 528, `${loc.world} : ${loc.subtitle}`, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fef08a',
      stroke: '#0f172a',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Right: Last equation & quick action buttons
    this.hudEquationText = this.add.text(710, 13, t('hudHint'), {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#bae6fd'
    }).setOrigin(1, 0);

    const undoBtn = this.add.text(720, 12, '⏪ [U]', {
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#e2e8f0',
      backgroundColor: '#1e293b',
      padding: { x: 5, y: 3 }
    }).setInteractive({ useHandCursor: true });
    undoBtn.on('pointerdown', () => this._triggerQuickUndo());

    this.hudMuteBtn = this.add.text(775, 12, soundFX.muted ? '🔇' : '🎵', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: soundFX.muted ? '#fda4af' : '#4ade80',
      backgroundColor: '#1e293b',
      padding: { x: 5, y: 3 }
    }).setInteractive({ useHandCursor: true });
    this.hudMuteBtn.on('pointerdown', () => {
      const muted = soundFX.toggleMute();
      this.hudMuteBtn.setText(muted ? '🔇' : '🎵');
      this.hudMuteBtn.setColor(muted ? '#fda4af' : '#4ade80');
      this._spawnFloatingText(480, 80, muted ? t('audioMutedToast') : t('audioOnToast'), '#fde047');
    });

    const langBtn = this.add.text(814, 12, getLang() === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN', {
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#93c5fd',
      backgroundColor: '#1e293b',
      padding: { x: 5, y: 3 }
    }).setInteractive({ useHandCursor: true });
    langBtn.on('pointerdown', () => {
      soundFX.playOperatorSwitch();
      toggleLang();
      langBtn.setText(getLang() === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN');
      const updatedLoc = getLocalizedLevelText(this.levelNumber, this.levelConfig.targetValue);
      this.hudStageText.setText(`${updatedLoc.world} : ${updatedLoc.subtitle}`);
      this._updateAllVisuals();
    });

    const restartBtn = this.add.text(874, 12, '↻ [R]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fde047',
      backgroundColor: '#1e293b',
      padding: { x: 5, y: 3 }
    }).setInteractive({ useHandCursor: true });
    restartBtn.on('pointerdown', () => this._restartLevel());

    const menuBtn = this.add.text(930, 12, '☰', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#1e293b',
      padding: { x: 7, y: 3 }
    }).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this._exitToMenu());
  }

  _triggerQuickUndo() {
    const res = this.counterP1.applyBrick('undo');
    if (res.accepted) {
      soundFX.playBrickBump();
      this._spawnFloatingText(480, 90, res.shortLabel, '#4ade80');
      this._updateAllVisuals();
    } else {
      soundFX.playReject();
    }
  }

  _setupControls() {
    this.input.keyboard.removeAllListeners();
    this.input.keyboard.removeAllKeys(true);
    this.p2JumpQueued = false;

    this.keys = this.input.keyboard.addKeys({
      // Joueur 1 : Flèches du clavier
      p1Left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      p1Right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      p1Jump: Phaser.Input.Keyboard.KeyCodes.UP,
      p1JumpAlt: Phaser.Input.Keyboard.KeyCodes.SPACE,
      // Joueur 2 : Compatible AZERTY (Q, Z, D) ET QWERTY/QWERTZ (A, W, D) simultanément !
      p2LeftQ: Phaser.Input.Keyboard.KeyCodes.Q,
      p2LeftA: Phaser.Input.Keyboard.KeyCodes.A,
      p2Right: Phaser.Input.Keyboard.KeyCodes.D,
      p2JumpZ: Phaser.Input.Keyboard.KeyCodes.Z,
      p2JumpW: Phaser.Input.Keyboard.KeyCodes.W,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
      menu: Phaser.Input.Keyboard.KeyCodes.ESC,
      mute: Phaser.Input.Keyboard.KeyCodes.M,
      lang: Phaser.Input.Keyboard.KeyCodes.L,
      undo: Phaser.Input.Keyboard.KeyCodes.U,
      backspace: Phaser.Input.Keyboard.KeyCodes.BACKSPACE
    });

    // Also listen to raw keydown events for 'z'/'w' by key character & physical code so AZERTY/QWERTY never misses a jump!
    this.input.keyboard.on('keydown', (ev) => {
      const k = (ev.key || '').toLowerCase();
      if (k === 'z' || k === 'w' || ev.code === 'KeyW' || ev.code === 'KeyZ') {
        this.p2JumpQueued = true;
      }
    });

    this.keys.restart.on('down', () => {
      this._restartLevel();
    });
    this.keys.menu.on('down', () => {
      this._exitToMenu();
    });
    this.keys.mute.on('down', () => {
      const muted = soundFX.toggleMute();
      if (this.hudMuteBtn) {
        this.hudMuteBtn.setText(muted ? '🔇' : '🎵');
        this.hudMuteBtn.setColor(muted ? '#fda4af' : '#4ade80');
      }
      this._spawnFloatingText(480, 80, muted ? t('audioMutedToast') : t('audioOnToast'), '#fde047');
    });
    this.keys.lang.on('down', () => {
      soundFX.playOperatorSwitch();
      toggleLang();
      const updatedLoc = getLocalizedLevelText(this.levelNumber, this.levelConfig.targetValue);
      this.hudStageText.setText(`${updatedLoc.world} : ${updatedLoc.subtitle}`);
      this._updateAllVisuals();
    });
    this.keys.undo.on('down', () => this._triggerQuickUndo());
    this.keys.backspace.on('down', () => this._triggerQuickUndo());
  }

  _setupCollisions() {
    this.physics.add.collider(this.players, this.platforms);
    this.physics.add.collider(this.slimesGroup, this.platforms);

    // Players bumping bricks from below
    this.physics.add.collider(this.players, this.bricksGroup, (player, brick) => {
      this._handleBrickCollision(player, brick);
    });

    // Players collecting operation bubbles
    this.physics.add.overlap(this.players, this.pickupsGroup, (player, pickup) => {
      this._handlePickupOverlap(player, pickup);
    });

    // Players interacting with Monsters (Slimes, Crabs, Bats, Frogs)
    this.physics.add.overlap(this.players, this.slimesGroup, (player, slime) => {
      this._handleSlimeOverlap(player, slime);
    });

    // Players hitting Traps (Spikes & Fireballs)
    this.physics.add.overlap(this.players, this.spikesGroup, (player, spike) => {
      this._handleTrapHazard(player, spike.x, spike.trapData?.penalty || 2, true);
    });
    this.physics.add.overlap(this.players, this.fireballsGroup, (player, fb) => {
      this._handleTrapHazard(player, fb.x, fb.trapData?.penalty || 3, false);
    });

    // Players entering the Top Door
    this.physics.add.overlap(this.players, this.doorZone, (player) => {
      this._handleDoorOverlap(player);
    });
  }

  _handleBrickCollision(player, brick) {
    const bData = brick.brickData;
    if (!bData) return;

    // Mario-style bottom-up bump: player head hits bottom of brick
    const hitFromBelow =
      player.body.touching.up ||
      player.body.blocked.up ||
      (player.body.center.y > brick.body.center.y + 8 &&
        Math.abs(player.body.center.x - brick.body.center.x) < 40);

    if (!hitFromBelow) return;

    const now = this.time.now;
    if (now - bData.lastBumpAt < 280) return;
    bData.lastBumpAt = now;

    // Bouncy brick bump animation
    const bumpTargets = bData.subCaption
      ? [brick, bData.labelText, bData.subCaption]
      : [brick, bData.labelText];
    this.tweens.add({
      targets: bumpTargets,
      y: '-=10',
      duration: 85,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        brick.y = bData.baseY;
        bData.labelText.y = bData.baseY - (bData.subCaption ? 4 : 0);
        if (bData.subCaption) {
          bData.subCaption.y = bData.baseY + 12;
        }
      }
    });

    const pData = player.playerData;
    const counter = pData.counter;

    if (bData.type === 'mystery') {
      soundFX.playBrickBump();
      const activePickups = this.pickupsGroup
        .getChildren()
        .filter((pk) => pk.active && pk.pickupData);
      const activeLabels = activePickups.map((pk) => pk.pickupData.label);
      const hint = counter.getHintSolution(activeLabels, this.levelConfig.bubblePool);

      // Ensure all bubbles required by the proposed solution exist on the platforms!
      const currentLabels = new Set(activeLabels);
      let morphIdx = 0;
      for (const step of hint.steps) {
        if (!currentLabels.has(step.label) && activePickups.length > 0) {
          const targetPickup = activePickups[morphIdx % activePickups.length];
          this._morphBubblePickup(targetPickup, step.label);
          currentLabels.add(step.label);
          morphIdx += 1;
        }
      }

      // Highlight the solution banner in a big, clear card at the top-center of the arena AND in the HUD!
      const titleStr = getLang() === 'fr' ? '💡 SOLUTION PROPOSÉE :' : '💡 SUGGESTED SOLUTION:';
      this._spawnHintBanner(titleStr, hint.formula);
      this.hudEquationText.setText(`💡 ${hint.formula}`);
      this._burstParticles(bData.baseX, bData.baseY - 16, 0xfde047, 14);
      this._updateAllVisuals(true);
      return;
    }

    if (bData.type === 'swap' && this.gameMode === '2p-versus') {
      soundFX.playOperatorSwitch();
      const tmpVal = this.counterP1.currentValue;
      this.counterP1.currentValue = this.counterP2.currentValue;
      this.counterP2.currentValue = tmpVal;
      this._spawnFloatingText(bData.baseX, bData.baseY - 28, t('numbersSwappedToast'), '#f5d0fe');
      this._updateAllVisuals();
      return;
    }

    const res = counter.applyBrick(bData.type);
    if (res.kind === 'operator') {
      soundFX.playOperatorSwitch();
      const opColor = OPERATORS[res.operator].hex;
      this._spawnFloatingText(bData.baseX, bData.baseY - 28, res.shortLabel, opColor);
      this._burstParticles(bData.baseX, bData.baseY, OPERATORS[res.operator].color);
    } else if (res.accepted) {
      soundFX.playBrickBump();
      this._spawnFloatingText(bData.baseX, bData.baseY - 28, res.shortLabel, '#4ade80');
      this.hudEquationText.setText(
        counter.history[counter.history.length - 1]?.expression || res.shortLabel
      );
      this._burstParticles(bData.baseX, bData.baseY, 0x4ade80);
    } else {
      soundFX.playReject();
      this._spawnFloatingText(bData.baseX, bData.baseY - 28, res.shortLabel, '#fda4af');
    }

    this._updateAllVisuals();
  }

  _handlePickupOverlap(player, pickup) {
    if (!pickup.active || this.levelCompleted) return;
    const pkData = pickup.pickupData;
    const pData = player.playerData;
    const counter = pData.counter;

    const res = counter.applyBubble(pkData.bubbleSpec);

    if (!res.accepted) {
      const now = this.time.now;
      if (now - pkData.lastRejectAt > 650) {
        pkData.lastRejectAt = now;
        soundFX.playReject();
        this._spawnFloatingText(pickup.x, pickup.y - 24, res.message, '#fda4af');
      }
      return;
    }

    soundFX.playPickup();
    const opColor = OPERATORS[res.operator]?.hex || '#fde047';
    this._spawnFloatingText(
      pickup.x,
      pickup.y - 20,
      `${res.shortLabel} → ${formatThreeDigits(res.value).formatted}`,
      opColor
    );
    this._burstParticles(pickup.x, pickup.y, OPERATORS[res.operator]?.color || 0xfde047);
    this.hudEquationText.setText(res.expression);

    // Clean up bubble and schedule respawn
    const { spawnX, spawnY, shouldRespawn, text, halo, floatTween } = pkData;
    floatTween.stop();
    text.destroy();
    halo.destroy();
    pickup.destroy();

    if (shouldRespawn) {
      const collectedByX = player.x;
      const collectedByY = player.y;
      this.time.delayedCall(2600, () => {
        if (!this.scene.isActive()) return;
        // 1. Pick a free slot FAR from where the bubble was collected & far from the players (no camping!)
        const nextSlot = this._pickDistantFreeSlot(spawnX, spawnY, collectedByX, collectedByY);
        // 2. Pick a varied building-block bubble from the stage pool (different from the one just popped!)
        const nextBubble = this._pickVariedPoolBubble(pkData.label);
        this._spawnPickup(nextSlot.x, nextSlot.y, nextBubble, true);
        this._updateAllVisuals();
      });
    }

    this._updateAllVisuals();
  }

  /**
   * Finds an unoccupied bubble slot far away from the previous slot and from active players
   * so players must move across platforms instead of staying in one place.
   */
  _pickDistantFreeSlot(oldX, oldY, playerX, playerY) {
    const candidates = this.levelConfig.allBubbleSlots || this.levelConfig.bubbleSlots || [];
    const activePickups = this.pickupsGroup.getChildren().filter((pk) => pk.active);

    // Filter slots that don't currently have a bubble on them and aren't the exact same spot
    const freeSlots = candidates.filter((s) => {
      const occupied = activePickups.some((pk) => Math.hypot(pk.x - s.x, pk.y - s.y) < 42);
      const sameSpot = Math.hypot(s.x - oldX, s.y - oldY) < 35;
      return !occupied && !sameSpot;
    });

    if (freeSlots.length === 0) {
      return { x: oldX, y: oldY };
    }

    // Sort free slots by distance from the player so new bubbles appear elsewhere in the arena
    freeSlots.sort((a, b) => {
      const distA = Math.hypot(a.x - playerX, a.y - playerY);
      const distB = Math.hypot(b.x - playerX, b.y - playerY);
      return distB - distA;
    });

    // Pick randomly among the top 2 most distant free slots
    const topChoices = freeSlots.slice(0, Math.min(2, freeSlots.length));
    return topChoices[Math.floor(Math.random() * topChoices.length)];
  }

  /**
   * Picks a standard building-block bubble from the level's pool (never auto-computing the exact remainder at the player's feet),
   * while ensuring at least one small unit bubble (+1, +2, -1, -2) is always somewhere on the map for solvability.
   */
  _pickVariedPoolBubble(previousLabel) {
    const activeLabels = new Set();
    this.pickupsGroup.getChildren().forEach((pk) => {
      if (pk.active && pk.pickupData?.label) {
        activeLabels.add(pk.pickupData.label);
      }
    });

    const pool = this.levelConfig.bubblePool || ['+9', '+7', '+5', '+3', '+2', '+1', '-3', '-2', '-1'];
    const cur = this.counterP1.currentValue;
    const target = this.counterP1.targetValue;

    // Proposition 1 & 3: When above the Door Target, NEVER spawn '×' bubbles;
    // prioritize exact divisors (÷2..÷10) or the small subtraction (-1..-5) that unlocks a division!
    if (cur > target) {
      const smartOver = this.counterP1.getSmartOvershootBubble(pool);
      if (smartOver && !activeLabels.has(smartOver.label)) {
        return smartOver.label;
      }
      const validDivisors = [];
      for (let d = 2; d <= 10; d++) {
        if (cur % d === 0 && cur / d >= Math.floor(target * 0.35)) {
          validDivisors.push(`÷${d}`);
        }
      }
      const minusPool = pool.filter((b) => b.startsWith('-') && b !== previousLabel);
      const overCandidates = [...validDivisors, ...minusPool];
      if (overCandidates.length > 0) {
        return overCandidates[Math.floor(Math.random() * overCandidates.length)];
      }
    }

    // Ensure at least one fine-tuning unit bubble (+1, +2, -1, -2) is present somewhere on the map
    const unitBubbles = ['+1', '+2', '-1', '-2'].filter((u) => pool.includes(u));
    const hasAnyUnit = unitBubbles.some((u) => activeLabels.has(u));
    if (!hasAnyUnit && unitBubbles.length > 0) {
      return unitBubbles[Math.floor(Math.random() * unitBubbles.length)];
    }

    // Avoid spawning the trivial 1-step exact remainder (+diff or -diff) when |diff| <= 10 so players combine 1..10 numbers!
    const diff = target - cur;
    const exactOneStepLabel = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '';

    // When below target, prefer + and × bubbles (with a few - bubbles for fine-tuning)
    const filteredPool = pool.filter((b) => {
      if (b === previousLabel || b === exactOneStepLabel) return false;
      if (cur < target && b.startsWith('÷')) return false;
      // Don't spawn a × bubble that would exceed getSmartMaxLimit()!
      if (b.startsWith('×')) {
        const factor = Number(b.slice(1));
        if (cur === 0 || cur * factor > this.counterP1.getSmartMaxLimit()) return false;
      }
      return true;
    });

    const list = filteredPool.length > 0 ? filteredPool : pool;
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Mutates an existing floating bubble in-place to a new operation (e.g. morphing '×' into '÷' or '-' when overshooting).
   */
  _morphBubblePickup(pickup, newBubbleSpec) {
    if (!pickup?.active || !pickup.pickupData) return;
    const parsed = parseBubbleSpec(newBubbleSpec, '+');
    const pkData = pickup.pickupData;
    if (pkData.label === parsed.label) return;

    const texKey = this.textures.exists(`bubble-${parsed.op}`) ? `bubble-${parsed.op}` : 'bubble-+';
    pickup.setTexture(texKey);
    pkData.bubbleSpec = parsed;
    pkData.op = parsed.op;
    pkData.value = parsed.value;
    pkData.label = parsed.label;
    pkData.text.setText(parsed.label);
    pkData.text.setFontSize(parsed.label.length >= 4 ? '14px' : '17px');
  }

  /**
   * Proposition 3: Dynamically adapts floating bubbles when the player overshoots (or drops back below) the Door Target.
   */
  _syncBubblesForOvershootState() {
    if (this.gameMode === '2p-versus') return;
    const cur = this.counterP1.currentValue;
    const target = this.counterP1.targetValue;
    const activePickups = this.pickupsGroup.getChildren().filter((pk) => pk.active && pk.pickupData);
    if (activePickups.length === 0) return;

    const pool = this.levelConfig.bubblePool || ['+9', '+7', '+5', '+3', '+2', '+1', '-3', '-2', '-1'];

    if (cur > target) {
      const smartOver = this.counterP1.getSmartOvershootBubble(pool);
      let hasSmartOver = activePickups.some((pk) => pk.pickupData.label === smartOver.label);
      const minusChoices = pool.filter((b) => b.startsWith('-'));

      let plusCount = 0;
      activePickups.forEach((pk, idx) => {
        const { op, value } = pk.pickupData;
        if (op === '+') plusCount += 1;

        // Morph any '×' bubble, any non-divisible '÷' bubble, or excess '+' bubbles into helpful '÷' or '-' bubbles!
        const isUnusableDiv = op === '÷' && cur % value !== 0;
        const isExcessPlus = op === '+' && plusCount > 2;
        if (op === '×' || isUnusableDiv || isExcessPlus) {
          if (!hasSmartOver && smartOver) {
            this._morphBubblePickup(pk, smartOver.label);
            hasSmartOver = true;
          } else {
            const subLabel = minusChoices[idx % minusChoices.length] || `-${(idx % 5) + 2}`;
            this._morphBubblePickup(pk, subLabel);
          }
        }
      });
    } else if (cur < target) {
      // When below target, ensure at least 3 bubbles on screen are '+' or valid '×' so player can climb easily
      const plusChoices = pool.filter((b) => b.startsWith('+'));
      let reducingCount = 0;
      activePickups.forEach((pk, idx) => {
        const { op, value } = pk.pickupData;
        const isInvalidMult =
          op === '×' && (cur === 0 || cur * value > this.counterP1.getSmartMaxLimit());
        if (op === '-' || op === '÷') {
          reducingCount += 1;
        }
        if (op === '÷' || (op === '-' && reducingCount > 2) || isInvalidMult) {
          const addLabel = plusChoices[idx % plusChoices.length] || `+${(idx % 6) + 2}`;
          this._morphBubblePickup(pk, addLabel);
        }
      });
    }
  }

  _handleSlimeOverlap(player, slime) {
    if (!slime.active || this.levelCompleted) return;
    const pData = player.playerData;
    const sData = slime.slimeData;

    // Check if player is falling onto the top of the monster (Mario stomp!)
    const isStomp = player.body.velocity.y > 0 && player.body.bottom <= slime.body.top + 18;

    if (isStomp) {
      soundFX.playSlimeStomp();
      player.setVelocityY(-410);
      this._burstParticles(slime.x, slime.y, 0xc084fc);
      this._spawnFloatingText(slime.x, slime.y - 20, t('slimeStompToast'), '#fde047');

      // Pop out a smart helper bubble on a free slot (never under a brick!)
      const helperBubble = pData.counter.getSmartBubble(this.levelConfig.bubblePool).label;
      const safeSlot = this._pickDistantFreeSlot(slime.x, slime.y, player.x, player.y);
      this._spawnPickup(safeSlot.x, safeSlot.y, helperBubble, false);

      sData.badge.destroy();
      slime.destroy();

      this.time.delayedCall(5000, () => {
        if (!this.scene.isActive()) return;
        this._spawnSlime(sData);
      });
      return;
    }

    // Side bump -> Funny swollen red head + tears + monster penalty!
    this._handleTrapHazard(player, slime.x, sData.penalty || 1, false);
  }

  _handleTrapHazard(player, hazardX, penalty = 1, bounceHigh = false) {
    if (this.levelCompleted) return;
    const pData = player.playerData;
    const now = this.time.now;
    if (now < pData.invulnerableUntil) return;
    pData.invulnerableUntil = now + 1650;
    pData.cryingUntil = now + 1650;

    soundFX.playFunnyCry();
    pData.counter.applySlimePenalty(penalty);
    this._spawnFloatingText(
      player.x,
      player.y - 58,
      t('slimePenaltyToast', { penalty }),
      '#fb7185'
    );

    // Switch to Swollen Red Crying Head sprite and animate comical head inflation + wobble!
    player.setTexture(getSkinTextureKey(pData.prefix, 'ouch'));
    player.setFlipX(false);

    if (pData.cryTween) {
      pData.cryTween.stop();
    }
    player.setScale(0.58, 0.62);
    player.setAngle(-10);
    pData.cryTween = this.tweens.add({
      targets: player,
      scaleX: 0.5,
      scaleY: 0.54,
      angle: 10,
      duration: 150,
      yoyo: true,
      repeat: 9,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        player.setScale(0.42);
        player.setAngle(0);
      }
    });

    // Squirt fountains of blue cartoon teardrops from both sides of the big red head!
    this._burstTears(player);

    // Knockback / bounce
    const dir = player.x < hazardX ? -1 : 1;
    player.setVelocityX(dir * 210);
    player.setVelocityY(bounceHigh ? -420 : -250);

    this._updateAllVisuals();
  }

  _burstTears(player) {
    // 3 waves of teardrops squirting out left and right from the player's swollen head!
    for (let wave = 0; wave < 3; wave++) {
      this.time.delayedCall(wave * 320, () => {
        if (!this.scene.isActive() || !player.active) return;
        const leftTears = this.add.particles(player.x - 16, player.y - 16, 'tear', {
          speedX: { min: -160, max: -65 },
          speedY: { min: -180, max: -70 },
          gravityY: 500,
          scale: { start: 0.95, end: 0.25 },
          lifespan: 620,
          emitting: false
        });
        leftTears.explode(5);

        const rightTears = this.add.particles(player.x + 16, player.y - 16, 'tear', {
          speedX: { min: 65, max: 160 },
          speedY: { min: -180, max: -70 },
          gravityY: 500,
          scale: { start: 0.95, end: 0.25 },
          lifespan: 620,
          emitting: false
        });
        rightTears.explode(5);

        this.time.delayedCall(700, () => {
          leftTears.destroy();
          rightTears.destroy();
        });
      });
    }
  }

  _handleDoorOverlap(player) {
    if (this.levelCompleted) return;
    const pData = player.playerData;
    if (pData.enteredDoor) return;
    if (!pData.counter.isDoorUnlocked()) return;

    pData.enteredDoor = true;

    // In 2P Co-op mode, BOTH players must pass through the door to win!
    if (this.gameMode === '2p-coop') {
      const allEntered = this.players.every((p) => p.playerData.enteredDoor);
      if (!allEntered) {
        soundFX.playPickup();
        this._burstParticles(this.levelConfig.doorX, this.levelConfig.doorY, 0x34d399, 16);
        player.body.enable = false;
        player.setVelocity(0, 0);
        player.setVisible(false);
        pData.badgeContainer.setVisible(false);
        const otherName = pData.id === 1 ? t('p2Name') : t('p1Name');
        this._spawnFloatingText(
          this.levelConfig.doorX,
          this.levelConfig.doorY - 70,
          t('coopFirstInToast', { name: pData.name, other: otherName }),
          '#34d399'
        );
        this._updateAllVisuals();
        return;
      }
    }

    this.levelCompleted = true;
    trackLevelEvent('level_end', this);
    player.body.enable = false;
    player.setVelocity(0, 0);
    player.setVisible(false);
    pData.badgeContainer.setVisible(false);

    soundFX.playVictory();
    this._burstParticles(this.levelConfig.doorX, this.levelConfig.doorY, 0xfacc15, 28);

    const elapsedSec = Math.max(1, Math.round((this.time.now - this.startTimeMs) / 1000));
    const steps = pData.counter.stepsCount;
    const par = this.levelConfig.parSteps || 4;
    const stars = steps <= par ? 3 : steps <= par + 2 ? 2 : 1;

    this.victoryTimer = this.time.delayedCall(450, () => {
      this.scene.start('VictoryScene', {
        mode: this.gameMode,
        level: this.levelNumber,
        winnerName: this.gameMode === '2p-versus' ? pData.name : t('teamName'),
        targetValue: pData.counter.targetValue,
        stepsCount: steps,
        parSteps: par,
        stars,
        elapsedSec,
        history: pData.counter.history
      });
    });
  }

  _updateAllVisuals(skipBubbleSync = false) {
    // 0. Dynamically morph bubbles if player overshot (or dropped back below) the Door Target!
    if (!skipBubbleSync) {
      this._syncBubblesForOvershootState();
    }

    // 1. Update HUD text
    const targetFmt = formatThreeDigits(this.levelConfig.targetValue).formatted;
    if (this.gameMode === '2p-versus') {
      const p1Fmt = this.counterP1.getFormattedCurrent().formatted;
      const p2Fmt = this.counterP2.getFormattedCurrent().formatted;
      this.hudCounterText.setText(
        t('hudVersus', { p1: p1Fmt, p2: p2Fmt, target: targetFmt })
      );
    } else {
      const curFmt = this.counterP1.getFormattedCurrent().formatted;
      this.hudCounterText.setText(
        t('hudCoop', { cur: curFmt, target: targetFmt })
      );
    }

    // 1b. Update brick captions when language changes
    if (this.brickObjects) {
      this.brickObjects.forEach((b) => {
        if (b?.brickData?.subCaption) {
          b.brickData.subCaption.setText(
            this._getLocalizedBrickCaption(b.brickData.type, b.brickData.caption)
          );
        }
      });
    }

    // 2. Update Top Door lock/unlock visual
    const anyUnlocked =
      this.counterP1.isDoorUnlocked() ||
      (this.gameMode === '2p-versus' && this.counterP2.isDoorUnlocked());

    // If in 2P Co-op a player was waiting inside the door and the other player changed the number, pop them back out!
    if (this.gameMode === '2p-coop' && !anyUnlocked && this.players) {
      this.players.forEach((p) => {
        if (p.playerData.enteredDoor) {
          p.playerData.enteredDoor = false;
          p.setPosition(this.levelConfig.doorX, this.levelConfig.doorY + 6);
          p.body.enable = true;
          p.setVisible(true);
          p.playerData.badgeContainer.setVisible(true);
          this._spawnFloatingText(
            this.levelConfig.doorX,
            this.levelConfig.doorY - 70,
            t('coopDoorRelockedToast'),
            '#fda4af'
          );
        }
      });
    }

    if (anyUnlocked && !this.wasDoorUnlocked) {
      soundFX.playDoorUnlock();
      this._burstParticles(this.levelConfig.doorX, this.levelConfig.doorY, 0xfacc15, 18);
      this._spawnFloatingText(
        this.levelConfig.doorX,
        this.levelConfig.doorY - 70,
        t('doorUnlockedToast'),
        '#fde047'
      );
    }
    this.wasDoorUnlocked = anyUnlocked;
    this._renderDoorState(anyUnlocked);

    if (this.gameMode === '2p-coop' && anyUnlocked && this.players) {
      const enteredCount = this.players.filter((p) => p.playerData.enteredDoor).length;
      if (enteredCount === 1) {
        this.doorStatusText.setText(t('doorHalfIn'));
      }
    }

    // 3. Update player overhead badges
    this.players.forEach((player) => {
      const pData = player.playerData;
      const c = pData.counter;
      const opInfo = OPERATORS[c.activeOperator] || OPERATORS['+'];
      const fmt = c.getFormattedCurrent().formatted;

      pData.badgeBg.clear();
      pData.badgeBg.fillStyle(c.isDoorUnlocked() ? 0xeab308 : opInfo.color, 0.95);
      pData.badgeBg.lineStyle(2, 0xffffff, 0.9);
      pData.badgeBg.fillRoundedRect(-28, -12, 56, 24, 8);
      pData.badgeBg.strokeRoundedRect(-28, -12, 56, 24, 8);

      pData.badgeText.setText(fmt);
    });

    // 4. Update divisibility sparkles on ÷ bubbles when they evenly divide the current number
    const checkDivCounter = this.counterP1;
    this.pickupsGroup.getChildren().forEach((pickup) => {
      if (!pickup.active || !pickup.pickupData) return;
      const { op, value, halo } = pickup.pickupData;
      const showHalo =
        op === '÷' &&
        (checkDivCounter.isDivisibleBy(value) ||
          (this.gameMode === '2p-versus' && this.counterP2.isDivisibleBy(value)));
      halo.setVisible(showHalo);
    });
  }

  _spawnHintBanner(titleStr, formulaStr) {
    if (this.activeHintBanner) {
      this.activeHintBanner.destroy();
      this.activeHintBanner = null;
    }
    const container = this.add.container(480, 195).setDepth(200);

    const headerTxt = this.add.text(0, -16, titleStr, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5);

    const formulaTxt = this.add.text(0, 10, formulaStr, {
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#fde047',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const w = Math.max(320, formulaTxt.width + 48, headerTxt.width + 48);
    const h = 68;
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.96);
    bg.lineStyle(3.5, 0xfacc15, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    container.add([bg, headerTxt, formulaTxt]);
    this.activeHintBanner = container;

    container.setScale(0.75);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 240,
      ease: 'Back.easeOut'
    });

    this.time.delayedCall(5000, () => {
      if (!this.scene.isActive() || !container.active) return;
      this.tweens.add({
        targets: container,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          if (this.activeHintBanner === container) {
            this.activeHintBanner = null;
          }
          container.destroy();
        }
      });
    });
  }

  _spawnFloatingText(x, y, message, color = '#ffffff') {
    const txt = this.add.text(x, y, message, {
      fontSize: '16px',
      fontStyle: 'bold',
      color,
      stroke: '#0f172a',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 34,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  _burstParticles(x, y, tint = 0xffffff, count = 10) {
    const emitter = this.add.particles(x, y, 'sparkle', {
      speed: { min: 50, max: 170 },
      scale: { start: 0.7, end: 0 },
      lifespan: 420,
      tint,
      emitting: false
    });
    emitter.explode(count);
    this.time.delayedCall(500, () => emitter.destroy());
  }

  update(time) {
    if (this.levelCompleted) return;

    // Read JustDown states ONCE per frame BEFORE iterating over players so Player 1 never consumes Player 2's jump!
    const p1JumpTriggered = Phaser.Input.Keyboard.JustDown(this.keys.p1Jump);
    const p1SpaceTriggered = Phaser.Input.Keyboard.JustDown(this.keys.p1JumpAlt);
    const p2JumpTriggered =
      this.p2JumpQueued ||
      Phaser.Input.Keyboard.JustDown(this.keys.p2JumpZ) ||
      Phaser.Input.Keyboard.JustDown(this.keys.p2JumpW);
    this.p2JumpQueued = false;

    const p2LeftDown = this.keys.p2LeftQ.isDown || this.keys.p2LeftA.isDown;
    const p2RightDown = this.keys.p2Right.isDown;

    // Update players movement & jumping
    this.players.forEach((player) => {
      const pData = player.playerData;
      if (pData.enteredDoor) return;
      const onFloor = player.body.blocked.down || player.body.touching.down;

      if (onFloor) {
        pData.coyoteUntil = time + 120;
        pData.jumpsUsed = 0;
      }

      let moveLeft = false;
      let moveRight = false;
      let jumpJustPressed = false;

      if (pData.id === 1) {
        moveLeft = this.keys.p1Left.isDown || (this.gameMode === '1p' && p2LeftDown);
        moveRight = this.keys.p1Right.isDown || (this.gameMode === '1p' && p2RightDown);
        jumpJustPressed =
          p1JumpTriggered ||
          (this.gameMode === '1p' && (p1SpaceTriggered || p2JumpTriggered));
      } else {
        moveLeft = p2LeftDown;
        moveRight = p2RightDown;
        jumpJustPressed = p2JumpTriggered;
      }

      const speed = 250;
      const walkToggle = Math.floor(time / 130) % 2 === 1;
      const isCrying = time < pData.cryingUntil;

      if (moveLeft && !moveRight) {
        player.setVelocityX(-speed);
        pData.facing = 'left';
        if (isCrying) {
          player.setTexture(getSkinTextureKey(pData.prefix, 'ouch'));
          player.setFlipX(false);
        } else if (!onFloor || walkToggle) {
          player.setTexture(getSkinTextureKey(pData.prefix, 'walk'));
          player.setFlipX(true);
        } else {
          player.setTexture(getSkinTextureKey(pData.prefix, 'left'));
          player.setFlipX(false);
        }
      } else if (moveRight && !moveLeft) {
        player.setVelocityX(speed);
        pData.facing = 'right';
        if (isCrying) {
          player.setTexture(getSkinTextureKey(pData.prefix, 'ouch'));
          player.setFlipX(false);
        } else if (!onFloor || walkToggle) {
          player.setTexture(getSkinTextureKey(pData.prefix, 'walk'));
          player.setFlipX(false);
        } else {
          player.setTexture(getSkinTextureKey(pData.prefix, 'right'));
          player.setFlipX(false);
        }
      } else {
        player.setVelocityX(player.body.velocity.x * 0.78);
        if (Math.abs(player.body.velocity.x) < 8) {
          player.setVelocityX(0);
        }
        if (isCrying) {
          player.setTexture(getSkinTextureKey(pData.prefix, 'ouch'));
          player.setFlipX(false);
        } else if (onFloor) {
          player.setTexture(getSkinTextureKey(pData.prefix, 'front'));
          player.setFlipX(false);
        }
      }

      // Allow grounded jump + 1 mid-air double-jump so kids can reach every platform effortlessly!
      if (jumpJustPressed && (time <= pData.coyoteUntil || pData.jumpsUsed < 2)) {
        const isDoubleJump = time > pData.coyoteUntil && pData.jumpsUsed >= 1;
        player.setVelocityY(-485);
        pData.coyoteUntil = 0;
        pData.jumpsUsed += 1;
        soundFX.playJump();
        if (isDoubleJump) {
          this._burstParticles(player.x, player.y + 24, 0xbae6fd, 8);
        }
      }

      // Keep overhead badge anchored above player's big head (higher when head is swollen!)
      pData.badgeContainer.setPosition(player.x, player.y - (isCrying ? 56 : 46));
    });

    // Update patrolling Monsters (Slimes, Crabs, Bats, Frogs)
    this.slimesGroup.getChildren().forEach((slime) => {
      if (!slime.active || !slime.slimeData) return;
      const sData = slime.slimeData;
      if (slime.x <= sData.minX) {
        slime.setVelocityX(Math.abs(sData.speed));
        slime.setFlipX(false);
      } else if (slime.x >= sData.maxX) {
        slime.setVelocityX(-Math.abs(sData.speed));
        slime.setFlipX(true);
      }

      const grounded = slime.body.blocked.down || slime.body.touching.down;
      if (sData.kind === 'bat') {
        // Sine-wave swooping flight
        slime.y = sData.flyY + Math.sin(time / 240 + sData.minX) * 20;
      } else if (sData.kind === 'frog' && grounded && time > sData.nextHopAt) {
        slime.setVelocityY(-310);
        sData.nextHopAt = time + 1450;
      } else if (sData.kind === 'crab' && grounded && time > sData.nextHopAt) {
        slime.setVelocityY(-165);
        sData.nextHopAt = time + 950;
      }

      sData.badge.setPosition(slime.x, slime.y - 22);
    });

    // Update rising/falling Fireball Traps
    if (this.fireballsGroup) {
      this.fireballsGroup.getChildren().forEach((fb) => {
        if (!fb.active || !fb.trapData) return;
        const td = fb.trapData;
        if (fb.y <= td.minY) {
          fb.setVelocityY(Math.abs(td.speedY));
        } else if (fb.y >= td.maxY) {
          fb.setVelocityY(-Math.abs(td.speedY));
        }
      });
    }
  }
}
