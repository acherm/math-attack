# Ben & Alice : l'Attaque des Maths / Ben & Alice's Math Attack 🎮✨

A fast-paced, cute 1-to-2 player Mario-style arcade math platformer for kids, built with **Phaser 3** and **Vite**, available in **Français 🇫🇷** and **English 🇬🇧**.

## Gameplay & Rules

- **Random Exit Door (`000`–`999`)**: Every stage starts at `000` and features a locked exit door with a randomly generated **Target Number** (`< 100` in Levels 1–4, and up to `999` in Levels 5–8).
- **Operation Bubbles (`1` to `10`)**: Catch floating color-coded bubbles (`+1`..`+10`, `-1`..`-10`, `×2`..`×10`, `÷2`..`÷10`) across 8 unique worlds and platform layouts!
- **Unlocking the Door**: When your Current Number **equals** the Door's Target Number, the door chimes, turns gold, and swings open! In **2P Co-op** mode, **both Ben and Alice** must pass through the open door to win.
- **Funny Monster & Trap Effect**: Getting bumped by a monster (*Slime, Crab, Bat, Frog*) or touching a trap (*Spikes, Fireball*) makes Ben or Alice's head temporarily swell up huge, turn bright red, and squirt cartoon tears!
- **20 Unlockable Skins & 10 Victory Dances**: Win levels to unlock **20 pixel-art skins** (*Fruits like Banana & Strawberry, Cute Animals like Panda & Pink Bunny, Jobs like Firefighter & Astronaut, and Sports*) and celebrate with **10 random victory dances**!

### Special Bricks (Bump from Below!)
- **`? AIDE / HELP` Block**: Displays a clear step-by-step mathematical formula with explicit parentheses (e.g. `((0 + 6) × 3) + 4 = 22`) to help reach the door.
- **`⏪ RETOUR / UNDO` & `000 ZÉRO` Blocks**: Revert your last operation or reset to `000`.

### Controls (Universal AZERTY + QWERTY Support & Double Jump!)
- **Player 1 (Default: Ben)**: Arrow keys (`←` / `→` to move, `↑` to jump, plus `Space` in 1P mode — **press Jump 2× for a Double Jump!**).
- **Player 2 (Default: Alice)**: Works simultaneously on **AZERTY (`Q`, `D`, `Z`)** and **QWERTY/QWERTZ (`A`, `D`, `W`)** (**2× Jump for Double Jump!**).
- **Shortcuts**: `S` to swap Ben & Alice between P1/P2, `K` to open the 20 Skins Gallery, `L` to switch language (`FR`/`EN`), `U` to undo, `R` to restart stage, `M` to mute/unmute music, `ESC` for Main Menu.

## Quick Start

```bash
npm install
npm run dev
```

## Testing & Production Build

```bash
npm test
npm run build
```

## Deployment (GitHub Pages)

GitHub Pages is configured via `.github/workflows/deploy.yml` and deploys automatically on every push to `main`.

