> **🇫🇷 Version française et mobile (fork)**
>
> 👉 **Jouer : <https://blog.mathieuacher.com/math-attack/>** (ordinateur, tablette ou téléphone)
>
> Fork du jeu de Julien Dubois et de ses enfants ([jeu original](https://julien-dubois.com/math-attack/), [dépôt original](https://github.com/jdubois/math-attack)). Ce qui change :
>
> - **Français par défaut**, quelle que soit la langue du navigateur (l'anglais reste dans le menu), et les derniers textes restés en anglais sont traduits (« Too High! », « Slime bump! », « LOCKED »…).
> - **Jouable sur téléphone et tablette** (code dans [`src/mobile/`](src/mobile/)) :
>   - le jeu occupe tout l'écran ; sur téléphone la caméra suit le héros, et la loupe **🔍** zoome ;
>   - **toucher l'écran** : touche où aller, **glisse vers le haut** pour sauter (continue = double saut), touche une plateforme plus haute pour que le héros y monte tout seul ; à 2 joueurs, chaque doigt fait bouger le héros le plus proche ;
>   - ou une **manette à l'écran**, au choix dans le menu (une par joueur sur tablette) ;
>   - textes adaptés au tactile, boutons plus gros, rotation de l'écran, plein écran, installable sur l'écran d'accueil.
> - **Pas de statistiques** : pas de Google Analytics ni de fenêtre cookies (bouton « Plein écran » à la place).
>
> La traduction des derniers textes et la version mobile sont dans des commits séparés, indépendants du fork : ils pourraient être proposés au dépôt original.

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

### Phones & Tablets
- The game fills the whole screen; on a phone the camera follows the heroes, and the **🔍** button zooms in.
- **Touch the screen** (default): tap where the hero should go, **swipe up** to jump (keep sliding for a double jump), tap a higher platform to climb onto it. In 2-player modes, each finger moves the hero closest to it.
- Or choose the **on-screen gamepad** in the menu (◀ ▶ pad + jump button; one per player on a tablet).
- Can be added to the home screen to play fullscreen in landscape.

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

## Optional analytics

The game uses the website's GA4 property (`G-92TRR0HJMQ`) and consent key
(`jdubois-analytics-consent`). Consent is shared only on the same origin; a separate
hostname needs its own choice. No Google script or analytics requests are initiated
before acceptance. The **Cookies** button at the bottom-left of the welcome screen
(opposite GitHub, also available with **C**) opens bilingual, parent-facing settings for
declining or withdrawing consent, including live changes from another tab.

On the first acceptance (or an already accepted page load), GA records one
`page_view`, plus `level_start`,
`level_end` (successful completion), `level_restart`, and `level_exit` (explicit
return to the menu during play, not closing the browser). Level events include only
`app_name: math_attack`, `level_number`, `game_mode`, and `game_language`;
`level_end` also includes `success: true`. Events before consent are discarded.
No names, answers, equations, scores, or persistent player IDs are added by the game.
GA itself uses cookies and collects standard browser/device information.
Advertising signals and ad personalization are disabled; URL queries, fragments,
and referrers are excluded from the initial page view.

In GA Admin, register `app_name`, `level_number`, `game_mode`, and `game_language`
as event-scoped custom dimensions for reports. Compare starts, completions,
restarts, and exits by level/mode to spot difficult stages. Disable enhanced
measurement in this shared web stream if only these explicitly documented events
are wanted. For this child-directed game, review the property's retention and
privacy settings and applicable parental-consent requirements before deployment;
the parent-facing prompt does not verify parental authority.

