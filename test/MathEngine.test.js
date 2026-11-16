import { describe, it, expect } from 'vitest';
import {
  MathCounter,
  formatThreeDigits,
  parseBubbleSpec,
  generateRandomTarget
} from '../src/math/MathEngine.js';
import { LEVELS, getLevelConfig } from '../src/levels/levels.js';
import {
  getLang,
  setLang,
  toggleLang,
  detectBrowserLang,
  resolveInitialLang,
  getActivePlayersInfo,
  togglePlayersSwapped,
  getSavedGameMode,
  setSavedGameMode,
  t
} from '../src/i18n/i18n.js';
import {
  SKINS,
  getUnlockedSkins,
  unlockNextSkinOnVictory,
  cycleSelectedSkin
} from '../src/skins/SkinsManager.js';

describe('formatThreeDigits', () => {
  it('formats numbers between 000 and 999 with place-value digits', () => {
    expect(formatThreeDigits(0)).toEqual({
      value: 0,
      formatted: '000',
      hundreds: 0,
      tens: 0,
      ones: 0
    });
    expect(formatThreeDigits(42)).toEqual({
      value: 42,
      formatted: '042',
      hundreds: 0,
      tens: 4,
      ones: 2
    });
    expect(formatThreeDigits(999)).toEqual({
      value: 999,
      formatted: '999',
      hundreds: 9,
      tens: 9,
      ones: 9
    });
  });

  it('clamps out-of-range numbers to 000..999', () => {
    expect(formatThreeDigits(-15).formatted).toBe('000');
    expect(formatThreeDigits(1250).formatted).toBe('999');
  });
});

describe('MathCounter operations & special bricks', () => {
  it('adds pickups and unlocks the door when current equals target', () => {
    const counter = new MathCounter({ startValue: 0, targetValue: 12, initialOperator: '+' });
    expect(counter.isDoorUnlocked()).toBe(false);

    expect(counter.applyPickup(5).value).toBe(5);
    expect(counter.applyPickup(5).value).toBe(10);
    const res = counter.applyPickup(2);
    expect(res.accepted).toBe(true);
    expect(res.value).toBe(12);
    expect(res.unlockedDoor).toBe(true);
    expect(counter.isDoorUnlocked()).toBe(true);

    // Overshooting locks the door again
    counter.applyPickup(1);
    expect(counter.currentValue).toBe(13);
    expect(counter.isDoorUnlocked()).toBe(false);
  });

  it('prevents exceeding 999 and clamps subtraction at 000', () => {
    const counter = new MathCounter({ startValue: 995, targetValue: 999, initialOperator: '+' });
    const tooHigh = counter.applyPickup(10);
    expect(tooHigh.accepted).toBe(false);
    expect(tooHigh.reason).toBe('too_high');
    expect(counter.currentValue).toBe(995);

    counter.applyBrick('-');
    counter.applyPickup(990);
    expect(counter.currentValue).toBe(5);
    counter.applyPickup(20);
    expect(counter.currentValue).toBe(0);
  });

  it('enforces clean whole-number division', () => {
    const counter = new MathCounter({ startValue: 36, targetValue: 9, initialOperator: '÷' });
    expect(counter.isDivisibleBy(4)).toBe(true);
    expect(counter.isDivisibleBy(7)).toBe(false);

    const badDiv = counter.applyPickup(7);
    expect(badDiv.accepted).toBe(false);
    expect(badDiv.reason).toBe('not_divisible');
    expect(counter.currentValue).toBe(36);

    const goodDiv = counter.applyPickup(4);
    expect(goodDiv.accepted).toBe(true);
    expect(goodDiv.value).toBe(9);
    expect(counter.isDoorUnlocked()).toBe(true);
  });

  it('supports place-value shift bricks (×10 and ÷10), nudge bricks, undo, and reset', () => {
    const counter = new MathCounter({ startValue: 8, targetValue: 85, initialOperator: '+' });

    const shiftUp = counter.applyBrick('×10');
    expect(shiftUp.accepted).toBe(true);
    expect(counter.currentValue).toBe(80);

    // ×10 again would be 800 (allowed)
    expect(counter.applyBrick('×10').value).toBe(800);
    // ×10 again would be 8000 (>999 -> rejected)
    expect(counter.applyBrick('×10').accepted).toBe(false);
    expect(counter.currentValue).toBe(800);

    // ÷10 shifts back to 80
    expect(counter.applyBrick('÷10').value).toBe(80);

    // +1 nudge brick
    expect(counter.applyBrick('+1').value).toBe(81);

    // Undo reverts +1 back to 80
    const undone = counter.applyBrick('undo');
    expect(undone.accepted).toBe(true);
    expect(counter.currentValue).toBe(80);

    // Reset returns to startValue (8)
    const reset = counter.applyBrick('reset');
    expect(reset.accepted).toBe(true);
    expect(counter.currentValue).toBe(8);
  });

  it('validates all campaign levels have unique decors, unique layouts, and guaranteed reachable targets', () => {
    expect(LEVELS.length).toBe(8);
    const decors = new Set(LEVELS.map((l) => l.decor));
    expect(decors.size).toBe(8);

    for (let i = 1; i <= 4; i++) {
      for (let run = 0; run < 15; run++) {
        const cfg = getLevelConfig(i);
        expect(cfg.targetValue).toBeGreaterThanOrEqual(1);
        expect(cfg.targetValue).toBeLessThan(100);
        expect(cfg.targetValue).not.toBe(cfg.startValue);
      }
    }
    for (let i = 5; i <= 8; i++) {
      const cfg = getLevelConfig(i);
      expect(cfg.targetValue).toBeGreaterThanOrEqual(100);
      expect(cfg.targetValue).toBeLessThanOrEqual(999);
    }

    // Verify that every stage starts at 0, all bubblePool values are in 1..10, and getWinningPathBubbles reaches targetValue using 1..10 operands!
    for (let level = 1; level <= 8; level++) {
      const cfg = getLevelConfig(level);
      expect(cfg.startValue).toBe(0);
      for (const b of cfg.bubblePool) {
        const parsed = parseBubbleSpec(b);
        expect(parsed.value).toBeGreaterThanOrEqual(1);
        expect(parsed.value).toBeLessThanOrEqual(10);
      }
      const sim = new MathCounter({ startValue: cfg.startValue, targetValue: cfg.targetValue });
      const steps = sim.getWinningPathBubbles();
      for (const st of steps) {
        expect(st.value).toBeGreaterThanOrEqual(1);
        expect(st.value).toBeLessThanOrEqual(10);
        sim.applyBubble(st.label);
      }
      expect(sim.currentValue).toBe(cfg.targetValue);
      expect(sim.isDoorUnlocked()).toBe(true);
    }

    // Verify that EVERY brick in all 8 levels has a standing surface directly underneath it
    // with 105..122px vertical clearance (83..100px gap for the 60px-tall player to walk under and jump-bump!)
    // and >= 65px clearance above the brick for popped bubbles!
    for (const lvl of LEVELS) {
      const surfaces = [
        { x: 480, width: 960, topY: 496 }, // Ground floor
        ...lvl.platforms.map((p) => ({ x: p.x, width: p.width, topY: p.y - 11 }))
      ];

      for (const brick of lvl.bricks) {
        // Find highest surface below brick.y that horizontally covers brick.x
        const below = surfaces
          .filter(
            (s) =>
              s.topY > brick.y &&
              brick.x >= s.x - s.width / 2 + 20 &&
              brick.x <= s.x + s.width / 2 - 20
          )
          .sort((a, b) => a.topY - b.topY)[0];

        expect(below, `Stage ${lvl.id} brick ${brick.type} at (${brick.x},${brick.y}) must have a platform below`).toBeDefined();
        const verticalClearance = below.topY - brick.y;
        expect(
          verticalClearance,
          `Stage ${lvl.id} brick ${brick.type} clearance ${verticalClearance}px`
        ).toBeGreaterThanOrEqual(105);
        expect(
          verticalClearance,
          `Stage ${lvl.id} brick ${brick.type} clearance ${verticalClearance}px`
        ).toBeLessThanOrEqual(122);

        // Ensure no platform ceiling blocks the space immediately above the brick (brick.y - 65 .. brick.y)
        const blockingAbove = lvl.platforms.find(
          (p) =>
            p.y < brick.y &&
            brick.y - p.y < 65 &&
            Math.abs(p.x - brick.x) < p.width / 2 + 25
        );
        expect(
          blockingAbove,
          `Stage ${lvl.id} brick ${brick.type} must have open space above for popped bubbles`
        ).toBeUndefined();
      }

      // Verify that EVERY platform AND the Top Door platform (platforms[0]) is reachable from the ground floor
      // using comfortable single-jump steps (dy <= 96px, horizontal edge gap <= 130px)
      const nodes = [
        { x: 480, y: 507, width: 960 },
        ...lvl.platforms
      ];
      const visited = new Set([0]);
      const queue = [0];
      while (queue.length > 0) {
        const cur = nodes[queue.shift()];
        for (let i = 1; i < nodes.length; i++) {
          if (visited.has(i)) continue;
          const next = nodes[i];
          const dy = cur.y - next.y;
          const edgeGap = Math.max(
            0,
            next.x - next.width / 2 - (cur.x + cur.width / 2),
            cur.x - cur.width / 2 - (next.x + next.width / 2)
          );
          const blockedOverhead =
            dy > 20 &&
            next.x - next.width / 2 <= cur.x - cur.width / 2 + 15 &&
            next.x + next.width / 2 >= cur.x + cur.width / 2 - 15;
          if (dy <= 96 && edgeGap <= 130 && !blockedOverhead) {
            visited.add(i);
            queue.push(i);
          }
        }
      }
      expect(visited.has(1), `Stage ${lvl.id} Top Door platform must be reachable`).toBe(true);
      expect(visited.size, `Stage ${lvl.id} all platforms must be reachable`).toBe(nodes.length);

      // Verify that NO trap (spikes or fireball) is anywhere near the player spawn zone
      // (1P spawns at x=430, y=452; 2P spawns at x=350, y=452 and x=610, y=452)
      const spawnPoints = [
        { x: 350, y: 452 },
        { x: 430, y: 452 },
        { x: 610, y: 452 }
      ];
      for (const trap of lvl.traps || []) {
        if (trap.type === 'spikes') {
          for (const sp of spawnPoints) {
            const dx = Math.abs(trap.x - sp.x);
            expect(
              dx,
              `Stage ${lvl.id} spikes at x=${trap.x} is too close to player spawn x=${sp.x}`
            ).toBeGreaterThanOrEqual(200);
          }
        }
        // Verify that NO trap (spikes or fireball) is underneath or horizontally aligned with ANY brick!
        for (const brick of lvl.bricks || []) {
          const dxBrick = Math.abs(trap.x - brick.x);
          expect(
            dxBrick,
            `Stage ${lvl.id} trap ${trap.type} at x=${trap.x} must not be under/near brick ${brick.type} at x=${brick.x}`
          ).toBeGreaterThanOrEqual(120);
        }
      }

      // Verify that NO bubble slot (initial or respawn) sits underneath or near any brick (AIDE, RETOUR, ZÉRO)
      const cfg = getLevelConfig(lvl.id);
      expect(cfg.allBubbleSlots.length).toBeGreaterThanOrEqual(8);
      for (const slot of cfg.allBubbleSlots) {
        for (const brick of cfg.bricks) {
          const underBrick =
            Math.abs(slot.x - brick.x) < 75 &&
            slot.y >= brick.y - 30 &&
            slot.y <= brick.y + 135;
          expect(
            underBrick,
            `Stage ${lvl.id} bubble slot (${slot.x},${slot.y}) must not sit under brick ${brick.type} (${brick.x},${brick.y})`
          ).toBe(false);
        }
      }
    }

    expect(generateRandomTarget(5, 29, 0)).toBeLessThan(30);
  });

  it('parses and applies operation bubbles (+10, -2, ×2, ÷5)', () => {
    expect(parseBubbleSpec('+10')).toEqual({ op: '+', value: 10, label: '+10' });
    expect(parseBubbleSpec('-2')).toEqual({ op: '-', value: 2, label: '-2' });
    expect(parseBubbleSpec('×3')).toEqual({ op: '×', value: 3, label: '×3' });
    expect(parseBubbleSpec('÷5')).toEqual({ op: '÷', value: 5, label: '÷5' });

    const counter = new MathCounter({ startValue: 0, targetValue: 16 });
    expect(counter.applyBubble('+10').value).toBe(10);
    expect(counter.applyBubble('-2').value).toBe(8);
    expect(counter.applyBubble('×2').unlockedDoor).toBe(true);
    expect(counter.getSmartBubble()).toEqual({ op: '+', value: 1, label: '+1' });

    // Proposition 2: Smart ceiling prevents multiplying way past a small door target
    const smallDoor = new MathCounter({ startValue: 20, targetValue: 28 });
    expect(smallDoor.getSmartMaxLimit()).toBe(53);
    expect(smallDoor.applyBubble('×3').accepted).toBe(false); // 60 > 53 -> blocked!

    // Proposition 1: Smart overshoot recovery (exact divisor when divisible, small subtraction when prime/non-divisible)
    const overEven = new MathCounter({ startValue: 140, targetValue: 50 });
    const divStep = overEven.getSmartOvershootBubble();
    expect(divStep.op).toBe('÷');
    expect(140 % divStep.value).toBe(0);

    const overPrime = new MathCounter({ startValue: 143, targetValue: 50 });
    const unblockStep = overPrime.getSmartOvershootBubble();
    expect(unblockStep.op).toBe('-');
    expect(unblockStep.value).toBeLessThanOrEqual(5);

    // Verify clean single-spaced hint formula formatting with explicit operator precedence parentheses
    const hintCounter = new MathCounter({ startValue: 0, targetValue: 15 });
    const hint = hintCounter.getHintSolution(['+8', '+7']);
    expect(hint.formula).toBe('8 + 7 = 15');
    expect(hint.steps.map((step) => step.label)).toEqual(['+8', '+7']);
    expect(hint.formula).not.toContain('  ');

    const multThenAdd = new MathCounter({ startValue: 6, targetValue: 22 });
    expect(multThenAdd.getHintSolution(['×3', '+4']).formula).toBe('(6 × 3) + 4 = 22');

    const addThenMult = new MathCounter({ startValue: 6, targetValue: 30 });
    expect(addThenMult.getHintSolution(['+4', '×3']).formula).toBe('(6 + 4) × 3 = 30');

    const threeStepsMixed = new MathCounter({ startValue: 0, targetValue: 22 });
    expect(threeStepsMixed.getHintSolution(['+6', '×3', '+4']).formula).toBe('(6 × 3) + 4 = 22');
    const singleStep = new MathCounter({ startValue: 0, targetValue: 3 });
    expect(singleStep.getHintSolution(['+3']).formula).toBe('3 = 3');
    const zeroTarget = new MathCounter({ startValue: 0, targetValue: 0 });
    expect(zeroTarget.getHintSolution().formula).toBe('000 = 000');
  });

  it('supports French and English language switching, browser detection, and remembering selection', () => {
    expect(detectBrowserLang({ languages: ['fr-FR', 'en-US'], language: 'fr-FR' })).toBe('fr');
    expect(detectBrowserLang({ languages: ['en-US'], language: 'en-US' })).toBe('en');
    expect(detectBrowserLang({ language: 'fr-CA' })).toBe('fr');
    expect(detectBrowserLang({ language: 'es-ES' })).toBe('en');

    // Mock localStorage to verify saved selection overrides browser default
    const store = new Map();
    const mockStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, v)
    };
    expect(resolveInitialLang(mockStorage, { language: 'fr-FR' })).toBe('fr');
    mockStorage.setItem('ben_alice_math_attack_lang', 'en');
    expect(resolveInitialLang(mockStorage, { language: 'fr-FR' })).toBe('en');

    setLang('fr');
    expect(getLang()).toBe('fr');
    expect(t('gameTitle')).toBe("Ben & Alice : l'Attaque des Maths");
    expect(t('doorLocked')).toContain('FERMÉE');
    toggleLang();
    expect(getLang()).toBe('en');
    expect(t('gameTitle')).toBe("Ben & Alice's Math Attack");
    expect(t('doorLocked')).toContain('LOCKED');
    setLang('fr');

    // Verify default 1P game mode and persistence
    expect(getSavedGameMode()).toBe('1p');
    setSavedGameMode('2p-coop');
    expect(getSavedGameMode()).toBe('2p-coop');
    setSavedGameMode('1p');
    expect(getSavedGameMode()).toBe('1p');

    // Verify player swapping and 20 skins unlocking (including Banana, Panda, Firefighter, Pineapple!)
    expect(getActivePlayersInfo().p1Name).toBe('Ben');
    togglePlayersSwapped();
    expect(getActivePlayersInfo().p1Name).toBe('Alice');
    togglePlayersSwapped();
    expect(getActivePlayersInfo().p1Name).toBe('Ben');

    expect(SKINS.length).toBe(20);
    expect(SKINS.some((s) => s.id === 'banana')).toBe(true);
    expect(SKINS.some((s) => s.id === 'panda')).toBe(true);
    expect(SKINS.some((s) => s.id === 'firefighter')).toBe(true);
    expect(SKINS.some((s) => s.id === 'pineapple')).toBe(true);
    const beforeCount = getUnlockedSkins().length;
    const unlocked = unlockNextSkinOnVictory();
    expect(unlocked).not.toBeNull();
    expect(getUnlockedSkins().length).toBe(beforeCount + 1);
    expect(cycleSelectedSkin('p1', 1).id).toBeDefined();
  });
});
