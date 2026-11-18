import Phaser from 'phaser';
import { LEVELS } from '../levels/levels.js';
import { soundFX } from '../audio/SoundEffects.js';
import { showAnalyticsSettings } from '../analytics/analytics.js';
import {
  getLang,
  setLang,
  toggleLang,
  getActivePlayersInfo,
  togglePlayersSwapped,
  getSavedGameMode,
  setSavedGameMode,
  t,
  keyLabel,
  getLocalizedLevelText
} from '../i18n/i18n.js';
import { getControlStyle, isTouchMode, setControlStyle } from '../mobile/touch-controls.js';
import { centerSceneCamera } from '../mobile/viewport.js';
import {
  SKINS,
  getUnlockedSkins,
  unlockAllSkins,
  getSelectedSkinInfo,
  setSelectedSkin,
  cycleSelectedSkin,
  getSkinTextureKey
} from '../skins/SkinsManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.selectedMode = getSavedGameMode();
    this.selectedLevel = 1;
  }

  create() {
    this.selectedMode = getSavedGameMode();
    soundFX.startMusic('menu');
    centerSceneCamera(this);
    // Sky gradient background (wider than 960 for wide screens, see centerSceneCamera)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x1e3a8a, 0x1e3a8a, 1);
    bg.fillRect(-1200, 0, 3360, 540);

    // Decorative hills
    bg.fillStyle(0x22c55e, 0.25);
    bg.fillEllipse(220, 520, 480, 140);
    bg.fillEllipse(740, 520, 520, 160);

    // Language, Player Swap & Music Menu at top bar
    this._createLanguageMenu();

    // Title Banner
    if (typeof document !== 'undefined') {
      document.title = t('gameTitle');
    }
    const titleTxt = this.add.text(480, 54, t('gameTitle'), {
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#fde047',
      stroke: '#0f172a',
      strokeThickness: 8
    }).setOrigin(0.5);
    if (titleTxt.width > 580) {
      titleTxt.setScale(580 / titleTxt.width);
    }

    this.menuSubtitleTxt = this.add.text(480, 96, t('menuSubtitle'), {
      fontSize: isTouchMode() ? '16px' : '14px',
      fontStyle: 'bold',
      color: '#bae6fd'
    }).setOrigin(0.5);
    if (this.menuSubtitleTxt.width > 560) {
      this.menuSubtitleTxt.setScale(560 / this.menuSubtitleTxt.width);
    }

    const playersInfo = getActivePlayersInfo();

    // Left Mascot (Player 1) & Right Mascot (Player 2) with Interactive Skin Selectors!
    this._createCharacterSkinPicker(86, 66, playersInfo.p1Prefix, `J1: ${playersInfo.p1Name}`);
    this._createCharacterSkinPicker(874, 66, playersInfo.p2Prefix, `J2: ${playersInfo.p2Name}`);

    // 1. Mode Selection Section
    this.add.text(480, 144, t('chooseMode'), {
      fontSize: isTouchMode() ? '16px' : '14.5px',
      fontStyle: 'bold',
      color: '#93c5fd'
    }).setOrigin(0.5);

    this.modeButtons = [];
    const modes = [
      {
        id: '1p',
        label: t('mode1pTitle', { p1: playersInfo.p1Name }),
        sub: t('mode1pSub')
      },
      {
        id: '2p-coop',
        label: t('modeCoopTitle'),
        sub: t('modeCoopSub', { p1: playersInfo.p1Name, p2: playersInfo.p2Name })
      },
      {
        id: '2p-versus',
        label: t('modeVersusTitle'),
        sub: t('modeVersusSub', { p1: playersInfo.p1Name, p2: playersInfo.p2Name })
      }
    ];

    modes.forEach((m, idx) => {
      const x = 200 + idx * 280;
      const y = 190;
      const btn = this._createChoiceCard(x, y, 255, 58, m.label, m.sub, () => {
        soundFX.playOperatorSwitch();
        this.selectedMode = setSavedGameMode(m.id);
        this._refreshSelectionStyles();
      });
      btn.modeId = m.id;
      this.modeButtons.push(btn);
    });

    // 2. Stage Selection Section
    this.add.text(480, 248, t('chooseStage'), {
      fontSize: isTouchMode() ? '16px' : '14.5px',
      fontStyle: 'bold',
      color: '#93c5fd'
    }).setOrigin(0.5);

    this.levelButtons = [];
    LEVELS.forEach((lvl, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const x = 165 + col * 210;
      const y = 296 + row * 64;
      const loc = getLocalizedLevelText(lvl.id, lvl.targetValue);
      const btn = this._createChoiceCard(
        x,
        y,
        196,
        52,
        t('stageCardTitle', { id: lvl.id, range: lvl.targetRangeLabel }),
        loc.name,
        () => {
          soundFX.playPickup();
          this.selectedLevel = lvl.id;
          this._refreshSelectionStyles();
        }
      );
      btn.levelId = lvl.id;
      this.levelButtons.push(btn);
    });

    // 3. Big Play Button
    const playBtnBg = this.add.graphics();
    playBtnBg.fillStyle(0x22c55e, 1);
    playBtnBg.lineStyle(4, 0xfef08a, 1);
    playBtnBg.fillRoundedRect(290, 412, 380, 54, 16);
    playBtnBg.strokeRoundedRect(290, 412, 380, 54, 16);

    const playZone = this.add.zone(480, 439, 380, 54).setInteractive({ useHandCursor: true });
    this.add.text(480, 439, t('startGameBtn'), {
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#052e16'
    }).setOrigin(0.5);

    playZone.on('pointerdown', () => this._startGame());

    // 4. Rules & Special Bricks Quick Legend Footer + GitHub Repo Link at Bottom Right
    const footerBg = this.add.graphics();
    footerBg.fillStyle(0x0f172a, 0.85);
    footerBg.lineStyle(1.5, 0x334155, 0.9);
    footerBg.fillRoundedRect(168, 478, 624, 46, 10);
    footerBg.strokeRoundedRect(168, 478, 624, 46, 10);

    this.footerTxt = this.add.text(480, 501, t('menuBricksFooter'), {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#e2e8f0'
    }).setOrigin(0.5);
    if (this.footerTxt.width > 596) {
      this.footerTxt.setScale(596 / this.footerTxt.width);
    }
    if (isTouchMode()) {
      // Touch screens: the footer lets players choose how to control the heroes.
      this.footerTxt.setVisible(false);
      this._createControlStyleToggle();
    }

    const cookieBg = this.add.graphics();
    cookieBg.fillStyle(0x0f172a, 0.92);
    cookieBg.lineStyle(1.5, 0x64748b, 0.95);
    cookieBg.fillRoundedRect(32, 478, 126, 46, 10);
    cookieBg.strokeRoundedRect(32, 478, 126, 46, 10);
    const cookieText = this.add.text(95, 501, t('analyticsSettings'), {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#93c5fd'
    }).setOrigin(0.5);
    const cookieZone = this.add.zone(95, 501, 126, 46)
      .setInteractive({ useHandCursor: true });
    cookieZone.on('pointerover', () => cookieText.setColor('#fde047'));
    cookieZone.on('pointerout', () => cookieText.setColor('#93c5fd'));
    cookieZone.on('pointerdown', () => showAnalyticsSettings());

    const ghBg = this.add.graphics();
    ghBg.fillStyle(0x0f172a, 0.92);
    ghBg.lineStyle(1.5, 0x64748b, 0.95);
    ghBg.fillRoundedRect(802, 478, 126, 46, 10);
    ghBg.strokeRoundedRect(802, 478, 126, 46, 10);

    const ghTxt = this.add.text(865, 501, '🐙 GitHub ↗', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#93c5fd'
    }).setOrigin(0.5);

    const ghZone = this.add
      .zone(865, 501, 126, 46)
      .setInteractive({ useHandCursor: true });
    ghZone.on('pointerover', () => ghTxt.setColor('#fde047'));
    ghZone.on('pointerout', () => ghTxt.setColor('#93c5fd'));
    ghZone.on('pointerdown', () => {
      if (typeof window !== 'undefined') {
        window.open('https://github.com/jdubois/math-attack', '_blank', 'noopener,noreferrer');
      }
    });

    this._refreshSelectionStyles();

    // Clear any previous keyboard listeners from prior scene restarts before binding
    this.input.keyboard.removeAllListeners();
    this.input.keyboard.on('keydown-C', () => showAnalyticsSettings());
    this.input.keyboard.once('keydown-SPACE', () => this._startGame());
    this.input.keyboard.once('keydown-ENTER', () => this._startGame());
    this.input.keyboard.on('keydown-L', () => {
      soundFX.playOperatorSwitch();
      toggleLang();
      this.scene.restart();
    });
    this.input.keyboard.on('keydown-S', () => {
      soundFX.playOperatorSwitch();
      togglePlayersSwapped();
      this.scene.restart();
    });
    this.input.keyboard.on('keydown-K', () => {
      soundFX.playPickup();
      if (this.skinsGalleryContainer) {
        this._closeSkinsGallery();
      } else {
        this._openSkinsGallery();
      }
    });
    this.input.keyboard.on('keydown-M', () => {
      const muted = soundFX.toggleMute();
      if (this.musicTxt) {
        this.musicTxt.setText(muted ? '🔇 [M]' : '🎵 [M]');
        this.musicTxt.setColor(muted ? '#fda4af' : '#4ade80');
      }
    });
  }

  // Touch screens: choose between touching the screen and the on-screen gamepad.
  _createControlStyleToggle() {
    this.add.text(262, 501, t('controlsLabel'), {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#93c5fd'
    }).setOrigin(0.5);
    [
      { id: 'screen', x: 455, label: t('controlsScreen') },
      { id: 'buttons', x: 660, label: t('controlsButtons') }
    ].forEach(({ id, x, label }) => {
      const active = getControlStyle() === id;
      const bg = this.add.graphics();
      bg.fillStyle(active ? 0x2563eb : 0x1e293b, 1);
      bg.lineStyle(active ? 3 : 1.5, active ? 0xfacc15 : 0x475569, 1);
      bg.fillRoundedRect(x - 98, 482, 196, 38, 10);
      bg.strokeRoundedRect(x - 98, 482, 196, 38, 10);
      const txt = this.add.text(x, 501, label, {
        fontSize: '16px',
        fontStyle: 'bold',
        color: active ? '#fde047' : '#e2e8f0'
      }).setOrigin(0.5);
      if (txt.width > 184) txt.setScale(184 / txt.width);
      const zone = this.add.zone(x, 501, 196, 44).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        if (getControlStyle() !== id) {
          soundFX.playOperatorSwitch();
          setControlStyle(id);
          this.scene.restart();
        }
      });
    });
  }

  _createCharacterSkinPicker(x, y, prefix, roleLabel) {
    const lang = getLang();
    const skinInfo = getSelectedSkinInfo(prefix);
    const unlockedCount = getUnlockedSkins().length;

    const mascot = this.add
      .image(x, y, getSkinTextureKey(prefix, 'front'))
      .setScale(0.55)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: mascot,
      y: y - 10,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(x, y - 48, roleLabel, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#fde047',
      stroke: '#0f172a',
      strokeThickness: 3
    }).setOrigin(0.5);

    const pillBg = this.add.graphics();
    pillBg.fillStyle(0x0f172a, 0.92);
    pillBg.lineStyle(2, 0xfacc15, 0.9);
    pillBg.fillRoundedRect(x - 66, y + 38, 132, 26, 8);
    pillBg.strokeRoundedRect(x - 66, y + 38, 132, 26, 8);

    const skinName = lang === 'fr' ? skinInfo.fr : skinInfo.en;
    const pillTxt = this.add.text(x, y + 51, `◀ ${skinInfo.icon} ${skinName} ▶`, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    if (pillTxt.width > 122) {
      pillTxt.setScale(122 / pillTxt.width);
    }

    const countTxt = this.add.text(
      x,
      y + 71,
      t('viewSkinsBtn'),
      {
        fontSize: isTouchMode() ? '12px' : '10px',
        fontStyle: 'bold',
        color: '#fde047',
        backgroundColor: '#1e293b',
        padding: { x: 4, y: 2 }
      }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });
    countTxt.on('pointerdown', () => {
      soundFX.playPickup();
      this._openSkinsGallery();
    });

    const cycleSkin = () => {
      soundFX.playPickup();
      const nextSkin = cycleSelectedSkin(prefix, 1);
      mascot.setTexture(getSkinTextureKey(prefix, 'front', nextSkin.id));
      const nextName = getLang() === 'fr' ? nextSkin.fr : nextSkin.en;
      pillTxt.setScale(1);
      pillTxt.setText(`◀ ${nextSkin.icon} ${nextName} ▶`);
      if (pillTxt.width > 122) {
        pillTxt.setScale(122 / pillTxt.width);
      }
    };

    mascot.on('pointerdown', cycleSkin);
    const pillZone = this.add.zone(x, y + 51, 132, 28).setInteractive({ useHandCursor: true });
    pillZone.on('pointerdown', cycleSkin);
  }

  _openSkinsGallery() {
    if (this.skinsGalleryContainer) {
      this.skinsGalleryContainer.destroy();
    }
    unlockAllSkins();
    const lang = getLang();
    const container = this.add.container(0, 0).setDepth(500);

    // Fullscreen dark backdrop
    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x0f172a, 0.97);
    backdrop.fillRect(-1200, -1200, 3360, 2940); // whole screen, even wide or tall ones
    const blockZone = this.add.zone(480, 270, 3360, 2940).setInteractive();
    container.add([backdrop, blockZone]);

    // Header
    const headerTitle = t('skinsGalleryTitle');
    const titleTxt = this.add.text(440, 24, headerTitle, {
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#fde047'
    }).setOrigin(0.5);
    if (titleTxt.width > 790) {
      titleTxt.setScale(790 / titleTxt.width);
    }
    container.add(titleTxt);

    // Close button
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0xe11d48, 1);
    closeBg.lineStyle(2, 0xffffff, 0.9);
    closeBg.fillRoundedRect(830, 8, 114, 32, 8);
    closeBg.strokeRoundedRect(830, 8, 114, 32, 8);
    const closeTxt = this.add.text(887, 24, t('closeBtn'), {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    const closeZone = this.add.zone(887, 24, 114, 32).setInteractive({ useHandCursor: true });
    closeZone.on('pointerdown', () => this._closeSkinsGallery());
    container.add([closeBg, closeTxt, closeZone]);

    // 5 columns x 4 rows grid of all 20 skins!
    const cols = 5;
    const cardW = 174;
    const cardH = 112;
    const startX = 104;
    const startY = 102;
    const gapX = 188;
    const gapY = 120;

    SKINS.forEach((skin, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col * gapX;
      const cy = startY + row * gapY;

      const isSelected =
        getSelectedSkinInfo('p1').id === skin.id || getSelectedSkinInfo('p2').id === skin.id;

      const cardBg = this.add.graphics();
      cardBg.fillStyle(isSelected ? 0x1e3a8a : 0x1e293b, 0.96);
      cardBg.lineStyle(isSelected ? 3 : 1.5, isSelected ? 0xfacc15 : 0x475569, 1);
      cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
      cardBg.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);

      // Show BOTH Ben (left) and Alice (right) wearing this skin!
      const benImg = this.add
        .image(cx - 32, cy - 10, getSkinTextureKey('p1', 'front', skin.id))
        .setScale(0.42);
      const aliceImg = this.add
        .image(cx + 32, cy - 10, getSkinTextureKey('p2', 'front', skin.id))
        .setScale(0.42);

      const skinLabel = `${skin.icon} ${lang === 'fr' ? skin.fr : skin.en}`;
      const lbl = this.add.text(cx, cy + 40, skinLabel, {
        fontSize: '12px',
        fontStyle: 'bold',
        color: isSelected ? '#fde047' : '#f8fafc'
      }).setOrigin(0.5);

      const cardHit = this.add
        .zone(cx, cy, cardW, cardH)
        .setInteractive({ useHandCursor: true });
      cardHit.on('pointerdown', () => {
        soundFX.playPickup();
        setSelectedSkin('p1', skin.id);
        setSelectedSkin('p2', skin.id);
        this._closeSkinsGallery();
      });

      container.add([cardBg, benImg, aliceImg, lbl, cardHit]);
    });

    this.skinsGalleryContainer = container;
  }

  _closeSkinsGallery() {
    if (this.skinsGalleryContainer) {
      this.skinsGalleryContainer.destroy();
      this.skinsGalleryContainer = null;
      this.scene.restart();
    }
  }

  _createLanguageMenu() {
    const lang = getLang();
    const playersInfo = getActivePlayersInfo();
    const container = this.add.container(480, 18);

    const frActive = lang === 'fr';
    const enActive = lang === 'en';

    const frBg = this.add.graphics();
    frBg.fillStyle(frActive ? 0x2563eb : 0x0f172a, 0.92);
    frBg.lineStyle(2, frActive ? 0xfacc15 : 0x475569, 1);
    frBg.fillRoundedRect(-235, -13, 98, 26, 8);
    frBg.strokeRoundedRect(-235, -13, 98, 26, 8);

    const frTxt = this.add.text(-186, 0, '🇫🇷 Français', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: frActive ? '#fde047' : '#cbd5e1'
    }).setOrigin(0.5);

    const zoneH = isTouchMode() ? 38 : 26; // bigger hit areas for fingers
    const frZone = this.add.zone(-186, 0, 98, zoneH).setInteractive({ useHandCursor: true });
    frZone.on('pointerdown', () => {
      if (getLang() !== 'fr') {
        soundFX.playOperatorSwitch();
        setLang('fr');
        this.scene.restart();
      }
    });

    const enBg = this.add.graphics();
    enBg.fillStyle(enActive ? 0x2563eb : 0x0f172a, 0.92);
    enBg.lineStyle(2, enActive ? 0xfacc15 : 0x475569, 1);
    enBg.fillRoundedRect(-130, -13, 98, 26, 8);
    enBg.strokeRoundedRect(-130, -13, 98, 26, 8);

    const enTxt = this.add.text(-81, 0, '🇬🇧 English', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: enActive ? '#fde047' : '#cbd5e1'
    }).setOrigin(0.5);

    const enZone = this.add.zone(-81, 0, 98, zoneH).setInteractive({ useHandCursor: true });
    enZone.on('pointerdown', () => {
      if (getLang() !== 'en') {
        soundFX.playOperatorSwitch();
        setLang('en');
        this.scene.restart();
      }
    });

    // Swap Players Button (⇄ J1: Ben / J2: Alice [S])
    const swapBg = this.add.graphics();
    swapBg.fillStyle(0x7c3aed, 0.92);
    swapBg.lineStyle(2, 0xfef08a, 0.9);
    swapBg.fillRoundedRect(-24, -13, 178, 26, 8);
    swapBg.strokeRoundedRect(-24, -13, 178, 26, 8);

    const swapTxt = this.add.text(
      65,
      0,
      t('swapPlayersBtn', { p1: playersInfo.p1Name, p2: playersInfo.p2Name }),
      {
        fontSize: '11.5px',
        fontStyle: 'bold',
        color: '#fef08a'
      }
    ).setOrigin(0.5);

    const swapZone = this.add.zone(65, 0, 178, zoneH).setInteractive({ useHandCursor: true });
    swapZone.on('pointerdown', () => {
      soundFX.playOperatorSwitch();
      togglePlayersSwapped();
      this.scene.restart();
    });

    // Music Toggle Button
    const musicBg = this.add.graphics();
    musicBg.fillStyle(0x0f172a, 0.92);
    musicBg.lineStyle(2, 0x475569, 1);
    musicBg.fillRoundedRect(162, -13, 76, 26, 8);
    musicBg.strokeRoundedRect(162, -13, 76, 26, 8);

    this.musicTxt = this.add.text(200, 0, keyLabel(soundFX.muted ? '🔇 [M]' : '🎵 [M]'), {
      fontSize: '12px',
      fontStyle: 'bold',
      color: soundFX.muted ? '#fda4af' : '#4ade80'
    }).setOrigin(0.5);

    const musicZone = this.add.zone(200, 0, 76, zoneH).setInteractive({ useHandCursor: true });
    musicZone.on('pointerdown', () => {
      const muted = soundFX.toggleMute();
      this.musicTxt.setText(keyLabel(muted ? '🔇 [M]' : '🎵 [M]'));
      this.musicTxt.setColor(muted ? '#fda4af' : '#4ade80');
    });

    container.add([
      frBg,
      frTxt,
      frZone,
      enBg,
      enTxt,
      enZone,
      swapBg,
      swapTxt,
      swapZone,
      musicBg,
      this.musicTxt,
      musicZone
    ]);
  }

  _createChoiceCard(x, y, w, h, title, subtitle, onClick) {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    const titleTxt = this.add.text(0, -8, title, {
      fontSize: isTouchMode() ? '16px' : '14.5px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    if (titleTxt.width > w - 16) {
      titleTxt.setScale((w - 16) / titleTxt.width);
    }

    const subTxt = this.add.text(0, 12, subtitle, {
      fontSize: isTouchMode() ? '13.5px' : '11.5px',
      color: '#cbd5e1'
    }).setOrigin(0.5);
    if (subTxt.width > w - 16) {
      subTxt.setScale((w - 16) / subTxt.width);
    }

    const hit = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', onClick);

    container.add([bg, titleTxt, subTxt, hit]);
    container.cardBg = bg;
    container.cardW = w;
    container.cardH = h;
    container.titleTxt = titleTxt;
    container.subTxt = subTxt;
    return container;
  }

  _refreshSelectionStyles() {
    this.modeButtons.forEach((btn) => {
      const active = btn.modeId === this.selectedMode;
      btn.cardBg.clear();
      btn.cardBg.fillStyle(active ? 0x2563eb : 0x1e293b, 0.95);
      btn.cardBg.lineStyle(active ? 3 : 1.5, active ? 0xfacc15 : 0x475569, 1);
      btn.cardBg.fillRoundedRect(-btn.cardW / 2, -btn.cardH / 2, btn.cardW, btn.cardH, 12);
      btn.cardBg.strokeRoundedRect(-btn.cardW / 2, -btn.cardH / 2, btn.cardW, btn.cardH, 12);
    });

    this.levelButtons.forEach((btn) => {
      const active = btn.levelId === this.selectedLevel;
      btn.cardBg.clear();
      btn.cardBg.fillStyle(active ? 0x7c3aed : 0x1e293b, 0.95);
      btn.cardBg.lineStyle(active ? 3 : 1.5, active ? 0xfacc15 : 0x475569, 1);
      btn.cardBg.fillRoundedRect(-btn.cardW / 2, -btn.cardH / 2, btn.cardW, btn.cardH, 10);
      btn.cardBg.strokeRoundedRect(-btn.cardW / 2, -btn.cardH / 2, btn.cardW, btn.cardH, 10);
    });
  }

  _startGame() {
    setSavedGameMode(this.selectedMode);
    soundFX.playDoorUnlock();
    this.scene.start('GameScene', {
      mode: this.selectedMode,
      level: this.selectedLevel
    });
  }
}
