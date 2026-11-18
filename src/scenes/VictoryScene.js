import Phaser from 'phaser';
import { formatThreeDigits } from '../math/MathEngine.js';
import { soundFX } from '../audio/SoundEffects.js';
import { getLang, t } from '../i18n/i18n.js';
import { isTouchMode } from '../mobile/touch-controls.js';
import { centerSceneCamera } from '../mobile/viewport.js';
import {
  unlockNextSkinOnVictory,
  getSkinTextureKey,
  setSelectedSkin
} from '../skins/SkinsManager.js';

export const VICTORY_DANCES = [
  {
    id: 1,
    fr: 'Danse #1 : Le Twist Turbo !',
    en: 'Dance #1: The Turbo Twist!'
  },
  {
    id: 2,
    fr: 'Danse #2 : Le Moonwalk Cosmique !',
    en: 'Dance #2: Cosmic Moonwalk!'
  },
  {
    id: 3,
    fr: 'Danse #3 : La Toupie sur la Tête (Headspin) !',
    en: 'Dance #3: Big-Head Breakdance Spin!'
  },
  {
    id: 4,
    fr: 'Danse #4 : Le Kangourou Disco (Saltos) !',
    en: 'Dance #4: Disco Kangaroo Flips!'
  },
  {
    id: 5,
    fr: 'Danse #5 : La Salsa des Grosses Têtes !',
    en: 'Dance #5: Bobblehead Salsa!'
  },
  {
    id: 6,
    fr: 'Danse #6 : Le Robot Électrique !',
    en: 'Dance #6: Electric Robot!'
  },
  {
    id: 7,
    fr: 'Danse #7 : Le Ressort Gélatine !',
    en: 'Dance #7: Jelly Boing-Boing!'
  },
  {
    id: 8,
    fr: 'Danse #8 : La Roue Acrobatique !',
    en: 'Dance #8: Cartwheel Fiesta!'
  },
  {
    id: 9,
    fr: 'Danse #9 : Le Pogo Rock’n’Roll !',
    en: 'Dance #9: Rock’n’Roll Pogo!'
  },
  {
    id: 10,
    fr: 'Danse #10 : La Pirouette Royale !',
    en: 'Dance #10: Royal Pirouette!'
  }
];

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  init(data) {
    this.gameMode = data?.mode || '1p';
    this.levelNumber = data?.level || 1;
    this.winnerName = data?.winnerName || t('teamName');
    this.targetValue = data?.targetValue ?? 12;
    this.stepsCount = data?.stepsCount ?? 1;
    this.parSteps = data?.parSteps ?? 4;
    this.stars = data?.stars ?? 3;
    this.elapsedSec = data?.elapsedSec ?? 10;
    this.history = data?.history || [];
    // Pick one of the 10 funny victory dances at random!
    this.currentDanceIndex =
      typeof data?.danceIndex === 'number'
        ? data.danceIndex
        : Math.floor(Math.random() * VICTORY_DANCES.length);

    // Unlock a new skin on victory and equip it for the celebration!
    this.newlyUnlockedSkin = unlockNextSkinOnVictory();
    if (this.newlyUnlockedSkin) {
      setSelectedSkin('p1', this.newlyUnlockedSkin.id);
      setSelectedSkin('p2', this.newlyUnlockedSkin.id);
    }
  }

  create() {
    soundFX.startMusic('victory');
    centerSceneCamera(this);
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x0f172a, 0x1e1b4b, 0x1e1b4b, 1);
    bg.fillRect(-1200, 0, 3360, 540); // wider than 960 for wide screens (centerSceneCamera)

    // Center Card Panel (leaves stage room on left & right for Ben and Alice to dance!)
    const card = this.add.graphics();
    card.fillStyle(0x1e293b, 0.95);
    card.lineStyle(4, 0xfacc15, 1);
    card.fillRoundedRect(175, 36, 610, 468, 20);
    card.strokeRoundedRect(175, 36, 610, 468, 20);

    // Spotlights on left (Ben) & right (Alice) dance stages
    const spots = this.add.graphics();
    spots.fillStyle(0xfef08a, 0.14);
    spots.fillEllipse(88, 340, 145, 290);
    spots.fillEllipse(872, 340, 145, 290);
    spots.fillStyle(0xfacc15, 0.35);
    spots.fillEllipse(88, 465, 130, 32);
    spots.fillEllipse(872, 465, 130, 32);

    const targetFmt = formatThreeDigits(this.targetValue).formatted;
    const titleStr =
      this.gameMode === '2p-versus'
        ? t('victoryVersusTitle', { winner: this.winnerName, target: targetFmt })
        : t('victoryCoopTitle', { target: targetFmt });

    this.add.text(480, 78, titleStr, {
      fontSize: '29px',
      fontStyle: 'bold',
      color: '#fde047',
      stroke: '#0f172a',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Stars display
    const starStr = '★'.repeat(this.stars) + '☆'.repeat(3 - this.stars);
    this.add.text(480, 122, starStr, {
      fontSize: '38px',
      color: '#facc15'
    }).setOrigin(0.5);

    this.add.text(
      480,
      160,
      t('victoryStats', {
        level: this.levelNumber,
        steps: this.stepsCount,
        par: this.parSteps,
        sec: this.elapsedSec
      }),
      {
        fontSize: '14.5px',
        fontStyle: 'bold',
        color: '#bae6fd'
      }
    ).setOrigin(0.5);

    // Active Dance Banner
    const danceBannerBg = this.add.graphics();
    danceBannerBg.fillStyle(0x7c3aed, 0.9);
    danceBannerBg.lineStyle(2, 0xfef08a, 0.9);
    danceBannerBg.fillRoundedRect(230, 182, 500, 34, 10);
    danceBannerBg.strokeRoundedRect(230, 182, 500, 34, 10);

    this.danceTitleText = this.add.text(480, 199, '', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);

    // Math Steps Recap Box
    const recapBg = this.add.graphics();
    recapBg.fillStyle(0x0f172a, 0.85);
    recapBg.fillRoundedRect(215, 224, 530, 134, 12);

    this.add.text(480, 242, t('victoryEquationsHeader'), {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#4ade80'
    }).setOrigin(0.5);

    const recentSteps = this.history.slice(-5).map((h, i) => `${i + 1}.  ${h.expression}`);
    const stepsText =
      recentSteps.length > 0
        ? recentSteps.join('\n')
        : t('victoryReachedFallback', { target: targetFmt });

    this.add.text(480, 298, stepsText, {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f8fafc',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    // If a new skin was unlocked, display a golden reward banner!
    if (this.newlyUnlockedSkin) {
      const skinBannerBg = this.add.graphics();
      skinBannerBg.fillStyle(0x15803d, 0.95);
      skinBannerBg.lineStyle(2, 0xfde047, 1);
      skinBannerBg.fillRoundedRect(215, 364, 530, 28, 8);
      skinBannerBg.strokeRoundedRect(215, 364, 530, 28, 8);

      const skinName = getLang() === 'fr' ? this.newlyUnlockedSkin.fr : this.newlyUnlockedSkin.en;
      this.add.text(
        480,
        378,
        t('skinUnlockedBanner', { icon: this.newlyUnlockedSkin.icon, name: skinName }),
        {
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#fef08a'
        }
      ).setOrigin(0.5);
    }

    // Create Dancing Characters on the Left & Right Spotlights!
    this.dancer1 = this.add.image(88, 390, getSkinTextureKey('p1', 'front')).setScale(0.75);
    this.dancer2 = this.add.image(872, 390, getSkinTextureKey('p2', 'front')).setScale(0.75);
    this.danceTweens = [];
    this.danceTimer = null;

    this._startDance(this.currentDanceIndex);

    // Action Buttons
    this._createActionButton(285, 412, 180, 42, 0x22c55e, t('nextStageBtn'), () => {
      this._goNextStage();
    });

    const nextDanceLabel = t('nextDanceBtn');
    this._createActionButton(480, 412, 185, 42, 0xd946ef, nextDanceLabel, () => {
      this._triggerAnotherRandomDance();
    });

    this._createActionButton(670, 412, 165, 42, 0x3b82f6, t('replayBtn'), () => {
      soundFX.playOperatorSwitch();
      this.scene.start('GameScene', { mode: this.gameMode, level: this.levelNumber });
    });

    this._createActionButton(480, 466, 170, 36, 0x64748b, t('menuBtn'), () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard.removeAllListeners();
    this.input.keyboard.once('keydown-SPACE', () => this._goNextStage());
    this.input.keyboard.once('keydown-ENTER', () => this._goNextStage());
    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('GameScene', { mode: this.gameMode, level: this.levelNumber });
    });
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
    this.input.keyboard.on('keydown-D', () => {
      this._triggerAnotherRandomDance();
    });
    this.input.keyboard.on('keydown-M', () => {
      soundFX.toggleMute();
    });
  }

  _triggerAnotherRandomDance() {
    soundFX.playPickup();
    // Pick a different random dance among the 10
    let nextIdx = Math.floor(Math.random() * VICTORY_DANCES.length);
    if (nextIdx === this.currentDanceIndex) {
      nextIdx = (nextIdx + 1) % VICTORY_DANCES.length;
    }
    this.currentDanceIndex = nextIdx;
    this._startDance(this.currentDanceIndex);
  }

  _startDance(danceIndex) {
    // Clean up previous dance tweens/timers
    this.danceTweens.forEach((tw) => tw.stop());
    this.danceTweens = [];
    if (this.danceTimer) {
      this.danceTimer.remove();
      this.danceTimer = null;
    }

    const dance = VICTORY_DANCES[danceIndex % VICTORY_DANCES.length];
    const lang = getLang();
    this.danceTitleText.setText(`🕺 ${lang === 'fr' ? dance.fr : dance.en}`);

    // Reset baseline transforms on both dancers
    const d1 = this.dancer1;
    const d2 = this.dancer2;
    [
      { sprite: d1, baseX: 88, prefix: 'p1' },
      { sprite: d2, baseX: 872, prefix: 'p2' }
    ].forEach(({ sprite, baseX, prefix }) => {
      sprite.setPosition(baseX, 390);
      sprite.setScale(0.75);
      sprite.setAngle(0);
      sprite.setFlipX(false);
      sprite.setTexture(getSkinTextureKey(prefix, 'front'));
    });

    // Sparkle burst on stage
    [88, 872].forEach((sx) => {
      const em = this.add.particles(sx, 390, 'sparkle', {
        speed: { min: 40, max: 140 },
        scale: { start: 0.7, end: 0 },
        lifespan: 450,
        tint: 0xfacc15,
        emitting: false
      });
      em.explode(12);
      this.time.delayedCall(500, () => em.destroy());
    });

    const id = dance.id;

    if (id === 1) {
      // 1. Le Twist Turbo : rapid pose switching + hip twist + bounce
      const poses = ['left', 'front', 'right', 'front'];
      let step = 0;
      this.danceTimer = this.time.addEvent({
        delay: 140,
        loop: true,
        callback: () => {
          const p = poses[step % poses.length];
          d1.setTexture(getSkinTextureKey('p1', p));
          d2.setTexture(getSkinTextureKey('p2', p));
          step += 1;
        }
      });
      this.danceTweens.push(
        this.tweens.add({
          targets: [d1, d2],
          angle: { from: -18, to: 18 },
          y: 368,
          duration: 180,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      );
    } else if (id === 2) {
      // 2. Le Moonwalk Cosmique : slides smoothly side-to-side in walk stride while facing opposite way!
      d1.setTexture(getSkinTextureKey('p1', 'walk'));
      d2.setTexture(getSkinTextureKey('p2', 'walk'));
      d1.setFlipX(true);
      d2.setFlipX(false);
      this.danceTweens.push(
        this.tweens.add({
          targets: d1,
          x: { from: 48, to: 128 },
          y: { from: 390, to: 378 },
          duration: 520,
          yoyo: true,
          repeat: -1,
          onYoyo: () => d1.setFlipX(!d1.flipX),
          onRepeat: () => d1.setFlipX(!d1.flipX)
        }),
        this.tweens.add({
          targets: d2,
          x: { from: 912, to: 832 },
          y: { from: 390, to: 378 },
          duration: 520,
          yoyo: true,
          repeat: -1,
          onYoyo: () => d2.setFlipX(!d2.flipX),
          onRepeat: () => d2.setFlipX(!d2.flipX)
        })
      );
    } else if (id === 3) {
      // 3. La Toupie sur la Tête (Headspin Breakdance!) : upside down spinning on their giant head!
      d1.setAngle(180);
      d2.setAngle(180);
      d1.setY(380);
      d2.setY(380);
      this.danceTweens.push(
        this.tweens.add({
          targets: [d1, d2],
          scaleX: { from: 0.75, to: -0.75 },
          y: 362,
          duration: 240,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      );
    } else if (id === 4) {
      // 4. Le Kangourou Disco : high jumps with 360° mid-air somersaults!
      d1.setTexture(getSkinTextureKey('p1', 'walk'));
      d2.setTexture(getSkinTextureKey('p2', 'walk'));
      this.danceTweens.push(
        this.tweens.add({
          targets: [d1, d2],
          y: 275,
          angle: 360,
          duration: 460,
          yoyo: true,
          repeat: -1,
          ease: 'Quad.easeOut'
        })
      );
    } else if (id === 5) {
      // 5. La Salsa des Grosses Têtes : rhythmic side-steps + leaning + pose swaps
      let step = 0;
      this.danceTimer = this.time.addEvent({
        delay: 250,
        loop: true,
        callback: () => {
          const p = step % 2 === 0 ? 'right' : 'left';
          d1.setTexture(getSkinTextureKey('p1', p));
          d2.setTexture(getSkinTextureKey('p2', p));
          step += 1;
        }
      });
      this.danceTweens.push(
        this.tweens.add({
          targets: d1,
          x: { from: 56, to: 120 },
          angle: { from: -14, to: 14 },
          duration: 250,
          yoyo: true,
          repeat: -1
        }),
        this.tweens.add({
          targets: d2,
          x: { from: 904, to: 840 },
          angle: { from: 14, to: -14 },
          duration: 250,
          yoyo: true,
          repeat: -1
        })
      );
    } else if (id === 6) {
      // 6. Le Robot Électrique : mechanical stepped snaps between poses and angles
      const states = [
        { pose: 'left', angle: -22, sy: 0.78 },
        { pose: 'front', angle: 0, sy: 0.68 },
        { pose: 'right', angle: 22, sy: 0.78 },
        { pose: 'walk', angle: -12, sy: 0.82 }
      ];
      let idx = 0;
      this.danceTimer = this.time.addEvent({
        delay: 190,
        loop: true,
        callback: () => {
          const st = states[idx % states.length];
          d1.setTexture(getSkinTextureKey('p1', st.pose));
          d2.setTexture(getSkinTextureKey('p2', st.pose));
          d1.setAngle(st.angle);
          d2.setAngle(-st.angle);
          d1.setScale(0.75, st.sy);
          d2.setScale(0.75, st.sy);
          idx += 1;
        }
      });
    } else if (id === 7) {
      // 7. Le Ressort Gélatine : hilarious accordion squash-and-stretch!
      this.danceTweens.push(
        this.tweens.add({
          targets: [d1, d2],
          scaleX: { from: 1.05, to: 0.52 },
          scaleY: { from: 0.48, to: 1.05 },
          y: { from: 410, to: 335 },
          duration: 230,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      );
    } else if (id === 8) {
      // 8. La Roue Acrobatique : continuous cartwheel spins + bounce!
      d1.setTexture(getSkinTextureKey('p1', 'walk'));
      d2.setTexture(getSkinTextureKey('p2', 'walk'));
      this.danceTweens.push(
        this.tweens.add({
          targets: d1,
          angle: 360,
          y: { from: 395, to: 335 },
          duration: 520,
          yoyo: true,
          repeat: -1
        }),
        this.tweens.add({
          targets: d2,
          angle: -360,
          y: { from: 395, to: 335 },
          duration: 520,
          yoyo: true,
          repeat: -1
        })
      );
    } else if (id === 9) {
      // 9. Le Pogo Rock'n'Roll : ultra fast pogo hops + headbanging!
      d1.setTexture(getSkinTextureKey('p1', 'right'));
      d2.setTexture(getSkinTextureKey('p2', 'left'));
      this.danceTweens.push(
        this.tweens.add({
          targets: [d1, d2],
          y: 315,
          angle: { from: -28, to: 28 },
          duration: 135,
          yoyo: true,
          repeat: -1,
          ease: 'Quad.easeOut'
        })
      );
    } else {
      // 10. La Pirouette Royale : graceful high ballet leap with fast 3D spin!
      const poses = ['front', 'right', 'front', 'left'];
      let step = 0;
      this.danceTimer = this.time.addEvent({
        delay: 110,
        loop: true,
        callback: () => {
          const p = poses[step % poses.length];
          d1.setTexture(getSkinTextureKey('p1', p));
          d2.setTexture(getSkinTextureKey('p2', p));
          step += 1;
        }
      });
      this.danceTweens.push(
        this.tweens.add({
          targets: [d1, d2],
          y: 290,
          scaleX: { from: 0.78, to: -0.78 },
          duration: 380,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      );
    }
  }

  _createActionButton(x, y, w, h, color, label, onClick) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.lineStyle(2.5, 0xffffff, 0.9);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);

    const labelTxt = this.add.text(x, y, label, {
      fontSize: isTouchMode() ? '16px' : '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    if (labelTxt.width > w - 12) {
      labelTxt.setScale((w - 12) / labelTxt.width);
    }

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', onClick);
  }

  _goNextStage() {
    soundFX.playDoorUnlock();
    this.scene.start('GameScene', {
      mode: this.gameMode,
      level: this.levelNumber + 1
    });
  }
}
