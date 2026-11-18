# AGENTS.md — Ben & Alice's Math Attack

Instructions and architectural invariants for AI coding agents working on this repository.

## 1. Project Overview

**Ben & Alice : l'Attaque des Maths** (*Ben & Alice's Math Attack*) is a fast-paced 1-to-2 player 2D arcade math platformer for kids built with **Phaser 3**, **Vite**, and **Vitest**.

- **Virtual Resolution**: `960 × 540` (`Phaser.Scale.FIT`, `Phaser.Scale.CENTER_BOTH`), Arcade Physics (`gravity.y = 920`).
- **Zero External Media Dependencies**: Character skins (`35 × 42` pixel-art grid upscaled `4×` to `140 × 170`), monsters, traps, bubbles, and chiptune music/SFX (Web Audio API) are generated procedurally at runtime.
- **Deployment**: Static bundle (`dist/` with `base: './'`) deployed automatically to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.

## 2. Essential Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server (http://localhost:5173/)
npm test           # Run Vitest unit & level-geometry test suite (MUST pass before completing any task)
npm run build      # Build production static bundle into dist/
```

## 3. Repository Structure

- `src/main.js` — Phaser game configuration and scene registration (`window.__GAME__`).
- `src/math/MathEngine.js` — Pure-JS math rules (`000`–`999`), `1`–`10` operation bubbles, smart ceiling (`getSmartMaxLimit`), overshoot recovery (`getSmartOvershootBubble`), and parenthesized hint formulas (`getHintSolution`).
- `src/levels/levels.js` — 8 campaign stages (unique decor, platform layout, door position, monsters, and traps per stage) + `getLevelConfig`.
- `src/i18n/i18n.js` — Bilingual French (`fr`) and English (`en`) translations, browser language detection, and `localStorage` state helpers (`lang`, `mode`, `swapped`).
- `src/skins/SkinsManager.js` — 20 unlockable 16-bit pixel-art skins (Sports, Adventure/Jobs, Cute Animals, Fruits including Banana) generated procedurally and persisted in `localStorage`.
- `src/audio/SoundEffects.js` — Web Audio API chiptune music sequencer (`menu`, `game`, `victory` themes) and procedural sound effects with HMR-safe singleton cleanup.
- `src/scenes/`
  - `BootScene.js` — Preloads base sprites and generates all procedural textures (20 skins × 2 characters × 5 poses, monsters, traps, bubbles).
  - `MenuScene.js` — Welcome screen, language/swap/music bar, 1P/2P mode cards, 8 stage cards, interactive skin pickers, 20-skin gallery modal (`[K]`), and GitHub repo link.
  - `GameScene.js` — Platformer gameplay, brick bumping, bubble collection/morphing, monster/trap collisions, crying swollen-head effect, and 2P Co-op door logic.
  - `VictoryScene.js` — Star rating, equation step recap, skin unlock celebration, and 10 random victory dances (`[D]`).
- `test/MathEngine.test.js` — Automated tests for math rules, i18n, skin unlocking, and strict level-design geometry invariants.
- `src/mobile/` — Phones & tablets: `touch-controls.js` (touch detection, control style & zoom preferences, on-screen gamepad, fullscreen, rotate hint), `GameSceneTouch.js` (mixed into `GameScene`: world + HUD cameras, 🔍 zoom, touch HUD layout, "touch the screen" controls with swipe-up jump and platform climbing), `viewport.js` (`Phaser.Scale.EXPAND` helpers and a Phaser 3.90 rotation workaround).
- `test/touch-texts.test.js` — Touch-screen text variants (`<key>Touch`, `<key>Screen`), hidden keyboard shortcuts, and fr/en key parity.

## 4. Calculation Engine & Level Design Specification

The complete mathematical rules, bubble-spawning algorithms, operator-precedence hint formatting, and level-design geometry constraints are documented in **[`SPECIFICATION.md`](./SPECIFICATION.md)**.

**Always read [`SPECIFICATION.md`](./SPECIFICATION.md) before modifying `src/math/MathEngine.js`, `src/levels/levels.js`, or `src/scenes/GameScene.js`.**

Key invariants enforced by `npm test` (`test/MathEngine.test.js`):

1. **Math Rules (`src/math/MathEngine.js` — see [`SPECIFICATION.md` §§ 1–5](./SPECIFICATION.md))**:
   - Every stage starts at **`000`** (`startValue: 0`) with a random target door (`< 100` for stages 1–4, `100–999` for stages 5–8, `015–999` for endless stages 9+).
   - Operation bubbles use operands from **`1` to `10` only** (`+1..+10`, `-1..-10`, `×2..×10`, `÷2..÷10`).
   - Division (`÷`) requires exact divisibility (`currentValue % n === 0`).
   - Bubble operations cannot exceed `getSmartMaxLimit()` (`min(999, max(target + 25, ceil(target * 1.45)))` for targets `< 700`, `999` otherwise) or drop below `000`.
   - When `currentValue > targetValue`, `getSmartOvershootBubble()` and `_syncBubblesForOvershootState()` morph active `×` bubbles into exact `÷` divisors or `-` bubbles so players never get stuck above the target.
   - Respawning bubbles must spawn at a distant unoccupied slot (`_pickDistantFreeSlot`, with `>= 8` candidate slots per stage) and avoid spawning the 1-step exact remainder (`target - current`) on normal climbs, preventing players from camping in one spot.
   - The `? AIDE / HELP` brick (`type: 'mystery'`) never spawns a bubble; it displays a centered hint banner with explicit operator-precedence parentheses (e.g. `((0 + 6) × 3) + 4 = 22`).

2. **Level Geometry Invariants (`src/levels/levels.js` — see [`SPECIFICATION.md` § 6](./SPECIFICATION.md))**:
   - **Reachability**: Every platform and the top door platform (`platforms[0]`) must be reachable in the platform graph from the ground floor (`y = 507`) via single-jump steps (`dy <= 96px`, horizontal edge gap `<= 130px`, not blocked directly overhead).
   - **Brick Clearance**: Every brick must have a standing surface directly underneath with `105..122px` vertical center-to-surface-top distance (`83..100px` floor-to-brick-bottom clearance, leaving `~23..40px` above the `60px`-tall player) and `>= 65px` open space above.
   - **No Bubbles or Traps Under Bricks**: No bubble slot (`allBubbleSlots`) may sit within `dx < 75px` and `y in [brick.y - 30, brick.y + 135]` of any brick. No trap (`spikes`, `fireball`) may sit within `dx < 120px` of any brick.
   - **Safe Player Spawn**: No `spikes` trap may be placed within `dx < 200px` of player spawn points (`x = 350, 430, 610`).

3. **Controls & Localization**:
   - **Player 1**: Arrow keys (`←`, `→`, `↑` to jump; `Space` also jumps **only** in `1p` mode). Supports Double Jump.
   - **Player 2**: Simultaneous AZERTY (`Q`, `D`, `Z`) and QWERTY/QWERTZ (`A`, `D`, `W`) support. Evaluate `JustDown` once per frame before the player loop so P1 never consumes P2's jump input.
   - **Touch screens** (`src/mobile/`): the canvas fills the screen (`EXPAND`); HUD objects must be created inside `_withUi()` (they are only rendered by the fixed UI camera). Touch-only texts use `<key>Touch` / `<key>Screen` variants in `i18n.js`, and keyboard shortcuts (`[K]`, `[ESC]`…) are hidden on touch screens (`keyLabel()` for hard-coded labels).
   - **Bilingual UI**: All new UI strings and brick captions (`AIDE`/`HELP`, `RETOUR`/`UNDO`, `ZÉRO`/`000`) must support both `fr` and `en` in `src/i18n/i18n.js` and fit within their card bounds without overflowing.
