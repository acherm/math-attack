const STORAGE_KEY = 'ben_alice_math_attack_lang';
const SWAP_PLAYERS_KEY = 'ben_alice_math_attack_swapped';
const GAME_MODE_KEY = 'ben_alice_math_attack_mode';

export const SUPPORTED_LANGS = ['fr', 'en'];
export const SUPPORTED_MODES = ['1p', '2p-coop', '2p-versus'];

let savedGameMode = '1p';
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const rawMode = window.localStorage.getItem(GAME_MODE_KEY);
    if (SUPPORTED_MODES.includes(rawMode)) {
      savedGameMode = rawMode;
    }
  }
} catch {
  // Ignore storage errors
}

export function getSavedGameMode() {
  return savedGameMode;
}

export function setSavedGameMode(mode) {
  if (SUPPORTED_MODES.includes(mode)) {
    savedGameMode = mode;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(GAME_MODE_KEY, mode);
      }
    } catch {
      // Ignore storage errors
    }
  }
  return savedGameMode;
}

let playersSwapped = false;
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    playersSwapped = window.localStorage.getItem(SWAP_PLAYERS_KEY) === 'true';
  }
} catch {
  // Ignore storage errors
}

export function isPlayersSwapped() {
  return playersSwapped;
}

export function togglePlayersSwapped() {
  playersSwapped = !playersSwapped;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SWAP_PLAYERS_KEY, String(playersSwapped));
    }
  } catch {
    // Ignore storage errors
  }
  return playersSwapped;
}

/**
 * Returns the active Player 1 (Arrows) and Player 2 (Z, Q, D) character mapping.
 */
export function getActivePlayersInfo() {
  if (playersSwapped) {
    return {
      p1Name: 'Alice',
      p1Prefix: 'p2',
      p2Name: 'Ben',
      p2Prefix: 'p1'
    };
  }
  return {
    p1Name: 'Ben',
    p1Prefix: 'p1',
    p2Name: 'Alice',
    p2Prefix: 'p2'
  };
}

/**
 * Detects the default language ('fr' or 'en') from the browser's navigator object.
 */
export function detectBrowserLang(nav = typeof navigator !== 'undefined' ? navigator : null) {
  if (!nav) return 'en';
  const primary =
    (Array.isArray(nav.languages) && nav.languages[0]) ||
    nav.language ||
    nav.userLanguage ||
    '';
  return String(primary).toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

/**
 * Resolves the initial language: uses the saved language from storage if present,
 * otherwise French (this fork is the French version: French by default, whatever the
 * browser language; English stays available in the menu and the choice is remembered).
 */
export function resolveInitialLang(
  storage = typeof window !== 'undefined' ? window.localStorage : null,
  nav = typeof navigator !== 'undefined' ? navigator : null
) {
  try {
    if (storage && typeof storage.getItem === 'function') {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved === 'fr' || saved === 'en') {
        return saved;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return 'fr';
}

let currentLang = resolveInitialLang();

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (SUPPORTED_LANGS.includes(lang)) {
    currentLang = lang;
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new Event('languagechange'));
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
    } catch {
      // Ignore storage errors
    }
  }
  return currentLang;
}

export function toggleLang() {
  return setLang(currentLang === 'fr' ? 'en' : 'fr');
}

export const TRANSLATIONS = {
  fr: {
    analyticsSettings: 'Cookies [C]',
    analyticsTitle: 'Parents : statistiques facultatives',
    analyticsDescription: "Avec votre accord, Google Analytics utilise des cookies pour mesurer les visites, les débuts et fins de niveau, les redémarrages et les retours au menu. Aucun nom ni détail des calculs n'est envoyé. Les fonctions publicitaires sont désactivées. Votre choix est partagé avec le site de Julien sur la même origine. Vous pouvez refuser ou retirer votre accord via Cookies, en bas à gauche de l'accueil. Le jeu reste identique.",
    analyticsDecline: 'Refuser',
    analyticsAccept: 'Accepter les statistiques',
    gameTitle: "Ben & Alice : l'Attaque des Maths",
    menuSubtitle: 'Attrape les bulles (+10, -2, ×2…) pour atteindre le nombre aléatoire de la porte !',
    langMenuLabel: 'LANGUE :',
    chooseMode: '1. CHOISIS LE MODE DE JEU',
    mode1pTitle: '1 Joueur ({p1})',
    mode1pSub: 'Flèches + ↑/Espace (Double Saut !)',
    modeCoopTitle: '2J Coop (Ben & Alice)',
    modeCoopSub: '{p1}: Flèches • {p2}: Z,Q,D (2× Saut !)',
    modeVersusTitle: '2J Duel (Ben vs Alice)',
    modeVersusSub: '{p1}: Flèches • {p2}: Z,Q,D (2× Saut !)',
    swapPlayersBtn: '⇄ J1: {p1} / J2: {p2} [S]',
    skinUnlockedBanner: '🎁 NOUVEAU SKIN DÉBLOQUÉ : {icon} {name} !',
    chooseStage: '2. CHOISIS TON NIVEAU (PORTE ALÉATOIRE)',
    stageCardTitle: 'Niveau {id} • 🎲 {range}',
    startGameBtn: '▶ JOUER (ESPACE / ENTRÉE)',
    menuBricksFooter:
      '🚀 Double Saut (appuie 2× pour sauter plus haut !)  •  Bulles : Chiffres 1 à 10  •  Bloc [? AIDE] : Affiche une Solution',
    p1Name: 'Ben',
    p2Name: 'Alice',
    teamName: 'Ben & Alice',
    hudCoop: 'NOMBRE : {cur}   ➜   PORTE CIBLE : {target}',
    hudVersus: 'BEN : {p1}   |   ALICE : {p2}   ➜   PORTE : {target}',
    hudHint: '🚀 Double Saut (2× Saut) • Attrape les bulles !',
    doorLocked: '🔒 FERMÉE',
    doorOpen: 'OUVERTE ! ▲',
    doorHalfIn: '1/2 ENTRÉ ▲',
    doorUnlockedToast: 'PORTE OUVERTE ! Saute dedans !',
    coopFirstInToast: '{name} est dans la porte ! Au tour de {other} !',
    coopDoorRelockedToast: 'Oups ! Porte refermée !',
    luckyPickupToast: 'Bulle magique {val} !',
    numbersSwappedToast: '⇄ Nombres échangés !',
    slimeStompToast: 'Boing ! +Bonus !',
    slimePenaltyToast: 'OUIN ! -{penalty} 😭',
    audioMutedToast: '🔇 Son coupé',
    audioOnToast: '🔊 Son activé',
    tooHighMsg: 'Trop grand ! ({candidate} > 999)',
    notDivisibleMsg: '{prev} ÷ {n} ne tombe pas juste !',
    invalidPickupMsg: 'Nombre invalide',
    modeSwitchLabel: 'Mode : {op}',
    shiftUpLabel: 'Décalage ×10 !',
    shiftDownLabel: 'Décalage ÷10 !',
    max999Label: 'Max 999 !',
    nothingToUndoLabel: 'Rien à annuler !',
    undoLabel: 'Annulé ! ({val})',
    alreadyResetLabel: 'Déjà au départ !',
    resetLabel: 'Zéro ({val})',
    resetHistoryExpr: 'Retour à {val}',
    victoryVersusTitle: '🏆 {winner} A OUVERT LA PORTE {target} !',
    victoryCoopTitle: '🎉 PORTE {target} OUVERTE !',
    victoryStats: 'Niveau {level} réussi en {steps} opérations (Par : {par}) • Temps : {sec}s',
    victoryEquationsHeader: 'TES OPÉRATIONS MATHÉMATIQUES :',
    victoryReachedFallback: 'Objectif {target} atteint !',
    nextStageBtn: '▶ SUIVANT [ESPACE]',
    replayBtn: '↻ REJOUER [R]',
    menuBtn: '☰ MENU [ESC]',
    nextDanceBtn: '💃 AUTRE DANSE [D]',
    viewSkinsBtn: '👕 Voir les 20 Skins [K]',
    skinsGalleryTitle: '👕 GALERIE DES 20 SKINS (BEN & ALICE) — Clique sur un skin pour le choisir !',
    closeBtn: '✕ FERMER',
    suggestedSolution: '💡 SOLUTION PROPOSÉE :',
    slimeShortLabel: '-{n} Aïe !',
    slimeBumpExpr: 'Aïe, un monstre ! {prev} - {n} = {val}',
    // Touch screens: '<key>Touch' replaces '<key>', and '<key>Screen' too with the
    // "touch the screen" controls (see src/mobile/touch-controls.js)
    mode1pSubTouch: 'Boutons ◀ ▶ et ⤒ (Double Saut !)',
    modeCoopSubTouch: 'Tablette : {p2} à gauche • {p1} à droite',
    modeVersusSubTouch: 'Tablette : {p2} à gauche • {p1} à droite',
    menuBricksFooterTouch: '🚀 Touche ⤒ 2× = Double Saut  •  Bloc [? AIDE] = Solution',
    hudHintTouch: '🚀 Touche ⤒ 2× : Double Saut !',
    skinsGalleryTitleTouch: '👕 GALERIE DES 20 SKINS (BEN & ALICE) — Touche un skin pour le choisir !',
    mode1pSubScreen: 'Touche où aller • glisse vers le haut = saut',
    modeCoopSubScreen: 'Le perso le plus proche du doigt bouge',
    modeVersusSubScreen: 'Le perso le plus proche du doigt bouge',
    hudHintScreen: '👆 Touche où aller • glisse ↑ = saut',
    jumpBtn: 'SAUT',
    controlsLabel: 'CONTRÔLES :',
    controlsScreen: "👆 Toucher l'écran",
    controlsButtons: '🎮 Manette',
    rotateHint: 'Tourne ton téléphone\npour jouer en grand !',
    rotateDismiss: 'Jouer quand même',
    fullscreenBtn: '⛶ Plein écran',
    exitFullscreenBtn: '⛶ Quitter'
  },
  en: {
    analyticsSettings: 'Cookies [C]',
    analyticsTitle: 'For parents: optional analytics',
    analyticsDescription: "With your permission, Google Analytics uses cookies to measure visits, level starts and completions, restarts, and returns to the menu. No names or calculation details are sent. Advertising features are disabled. Your choice is shared with Julien's website on the same origin. You can decline or withdraw consent via Cookies at the bottom-left of the welcome screen. The game stays the same.",
    analyticsDecline: 'Decline',
    analyticsAccept: 'Accept analytics',
    gameTitle: "Ben & Alice's Math Attack",
    menuSubtitle: 'Catch operation bubbles (+10, -2, ×2…) to match the random Door Number!',
    langMenuLabel: 'LANGUAGE:',
    chooseMode: '1. CHOOSE PLAYER MODE',
    mode1pTitle: '1 Player ({p1})',
    mode1pSub: 'Arrows + ↑/Space (Double Jump!)',
    modeCoopTitle: '2P Co-op (Ben & Alice)',
    modeCoopSub: '{p1}: Arrows • {p2}: W,A,D/Z,Q,D (2× Jump!)',
    modeVersusTitle: '2P Versus (Ben vs Alice)',
    modeVersusSub: '{p1}: Arrows • {p2}: W,A,D/Z,Q,D (2× Jump!)',
    swapPlayersBtn: '⇄ P1: {p1} / P2: {p2} [S]',
    skinUnlockedBanner: '🎁 NEW SKIN UNLOCKED: {icon} {name}!',
    chooseStage: '2. SELECT STAGE (RANDOM DOOR TARGET)',
    stageCardTitle: 'Stage {id} • 🎲 {range}',
    startGameBtn: '▶ START GAME (SPACE / ENTER)',
    menuBricksFooter:
      '🚀 Double Jump (press Jump 2× in air!)  •  Bubbles: Numbers 1 to 10  •  [? HELP] Block: Shows a Solution',
    p1Name: 'Ben',
    p2Name: 'Alice',
    teamName: 'Ben & Alice',
    hudCoop: 'NUMBER: {cur}   ➜   TARGET DOOR: {target}',
    hudVersus: 'BEN: {p1}   |   ALICE: {p2}   ➜   DOOR: {target}',
    hudHint: '🚀 Double Jump (2× Jump) • Catch the bubbles!',
    doorLocked: '🔒 LOCKED',
    doorOpen: 'OPEN! ▲',
    doorHalfIn: '1/2 IN! ▲',
    doorUnlockedToast: 'DOOR UNLOCKED! Jump in!',
    coopFirstInToast: '{name} is in the door! Waiting for {other}!',
    coopDoorRelockedToast: 'Oops! Door locked again!',
    luckyPickupToast: 'Magic Bubble {val}!',
    numbersSwappedToast: '⇄ Numbers Swapped!',
    slimeStompToast: 'Boing! +Bonus!',
    slimePenaltyToast: 'WAAAH! -{penalty} 😭',
    audioMutedToast: '🔇 Audio Muted',
    audioOnToast: '🔊 Audio On',
    tooHighMsg: 'Too High! ({candidate} > 999)',
    notDivisibleMsg: '{prev} ÷ {n} has a remainder!',
    invalidPickupMsg: 'Invalid number',
    modeSwitchLabel: 'Mode: {op}',
    shiftUpLabel: '×10 Shift!',
    shiftDownLabel: '÷10 Shift!',
    max999Label: 'Max 999!',
    nothingToUndoLabel: 'Nothing to Undo!',
    undoLabel: 'Undo! ({val})',
    alreadyResetLabel: 'Already at Start!',
    resetLabel: 'Reset ({val})',
    resetHistoryExpr: 'Reset to {val}',
    victoryVersusTitle: '🏆 {winner} UNLOCKED DOOR {target}!',
    victoryCoopTitle: '🎉 DOOR {target} UNLOCKED!',
    victoryStats: 'Stage {level} Cleared in {steps} Math Steps (Par: {par}) • Time: {sec}s',
    victoryEquationsHeader: 'YOUR MATH EQUATION STEPS:',
    victoryReachedFallback: 'Reached {target}!',
    nextStageBtn: '▶ NEXT STAGE [SPACE]',
    replayBtn: '↻ REPLAY [R]',
    menuBtn: '☰ MENU [ESC]',
    nextDanceBtn: '💃 NEXT DANCE [D]',
    viewSkinsBtn: '👕 View 20 Skins [K]',
    skinsGalleryTitle: '👕 ALL 20 SKINS GALLERY (BEN & ALICE) — Click any skin to equip!',
    closeBtn: '✕ CLOSE',
    suggestedSolution: '💡 SUGGESTED SOLUTION:',
    slimeShortLabel: '-{n} Slime!',
    slimeBumpExpr: 'Slime bump! {prev} - {n} = {val}',
    mode1pSubTouch: '◀ ▶ pad + ⤒ button (Double Jump!)',
    modeCoopSubTouch: 'Tablet: {p2} on the left • {p1} on the right',
    modeVersusSubTouch: 'Tablet: {p2} on the left • {p1} on the right',
    menuBricksFooterTouch: '🚀 Tap ⤒ twice = Double Jump  •  [? HELP] Block = Solution',
    hudHintTouch: '🚀 Tap ⤒ twice: Double Jump!',
    skinsGalleryTitleTouch: '👕 ALL 20 SKINS GALLERY (BEN & ALICE) — Tap any skin to equip!',
    mode1pSubScreen: 'Tap where to go • swipe up = jump',
    modeCoopSubScreen: 'The hero nearest your finger moves',
    modeVersusSubScreen: 'The hero nearest your finger moves',
    hudHintScreen: '👆 Tap where to go • swipe ↑ = jump',
    jumpBtn: 'JUMP',
    controlsLabel: 'CONTROLS:',
    controlsScreen: '👆 Touch the screen',
    controlsButtons: '🎮 Gamepad',
    rotateHint: 'Turn your phone\nto play bigger!',
    rotateDismiss: 'Play anyway',
    fullscreenBtn: '⛶ Fullscreen',
    exitFullscreenBtn: '⛶ Exit'
  }
};

export const LEVEL_TRANSLATIONS = {
  fr: {
    1: {
      world: 'Monde 1-1 • Prairie Ensoleillée',
      name: 'La Pyramide des Prés',
      subtitle: 'Grimpe la pyramide et attrape les bulles pour ouvrir la porte (< 030) !'
    },
    2: {
      world: 'Monde 1-2 • Plage Tropicale',
      name: 'L’Escalier des Palmiers',
      subtitle: 'Monte l’escalier vers la porte à droite en évitant les Crabes et Pics !'
    },
    3: {
      world: 'Monde 2-1 • Grotte de Cristal',
      name: 'Les Tours de Cristal',
      subtitle: 'Attention à la Chauve-Souris ! Porte en haut à gauche (< 100) !'
    },
    4: {
      world: 'Monde 2-2 • Désert des Pyramides',
      name: 'Le Canyon en Zig-Zag',
      subtitle: 'Évite la Boule de Feu et le Crapaud sauteur dans le désert !'
    },
    5: {
      world: 'Monde 3-1 • Sommets Enneigés',
      name: 'Les Îles de Glace',
      subtitle: 'Utilise [×2] et [×3] sur les glaciers pour atteindre 100–300 !'
    },
    6: {
      world: 'Monde 3-2 • Forêt Enchantée',
      name: 'La Canopée Enchantée',
      subtitle: 'Saute de branche en branche vers la cabane en haut à gauche !'
    },
    7: {
      world: 'Monde 4-1 • Volcan Magique',
      name: 'La Forteresse de Lave',
      subtitle: 'Esquive les Boules de Feu et combine [×2], [×3] et [+100] !'
    },
    8: {
      world: 'Monde 4-2 • Galaxie Étoilée',
      name: 'La Citadelle Galactique',
      subtitle: 'Flotte entre les planètes et anneaux pour ouvrir la Porte 100–999 !'
    }
  },
  en: {
    1: {
      world: 'World 1-1 • Sunny Meadow',
      name: 'The Meadow Pyramid',
      subtitle: 'Climb the pyramid and catch bubbles to unlock the door (< 030)!'
    },
    2: {
      world: 'World 1-2 • Tropical Beach',
      name: 'Palm Tree Staircase',
      subtitle: 'Climb up to the top-right door while dodging Crabs and Spikes!'
    },
    3: {
      world: 'World 2-1 • Crystal Cavern',
      name: 'Twin Crystal Towers',
      subtitle: 'Watch out for the swooping Bat! Top-left door (< 100)!'
    },
    4: {
      world: 'World 2-2 • Pyramid Desert',
      name: 'Zig-Zag Canyon',
      subtitle: 'Dodge the Fireball and leaping Frog across the desert ledges!'
    },
    5: {
      world: 'World 3-1 • Snowy Peaks',
      name: 'Floating Ice Islands',
      subtitle: 'Use [×2] and [×3] across the glaciers to reach 100–300!'
    },
    6: {
      world: 'World 3-2 • Enchanted Forest',
      name: 'Canopy Treehouse',
      subtitle: 'Hop from branch to branch up to the top-left treehouse door!'
    },
    7: {
      world: 'World 4-1 • Magic Volcano',
      name: 'Lava Fortress',
      subtitle: 'Dodge rising Fireballs and combine [×2], [×3], and [+100]!'
    },
    8: {
      world: 'World 4-2 • Starlight Galaxy',
      name: 'Galactic Citadel',
      subtitle: 'Hop between cosmic rings to unlock Door 100–999!'
    }
  }
};

// Touch screens (see src/mobile/touch-controls.js): texts may have touch variants, tried
// in order (e.g. ['Screen', 'Touch'] looks up 'hudHintScreen', then 'hudHintTouch', then
// 'hudHint'), and keyboard shortcuts such as "[K]" or "[ESC]" are hidden.
let textVariants = [];

export function setTextVariants(suffixes = []) {
  textVariants = suffixes;
}

/** Removes keyboard shortcuts ("[K]", "[ESC]", "(ESPACE / ENTRÉE)"…) but keeps "[? AIDE]". */
export function hideKeyHints(str) {
  return str
    .replace(/\s*\((?:ESPACE|SPACE) \/ (?:ENTRÉE|ENTER)\)/g, '')
    .replace(/\s*\[(?:[A-Z]|ESC|ESPACE|SPACE|ENTRÉE|ENTER)\]/g, '');
}

/** A label with keyboard shortcuts (e.g. '⏪ [U]'), shown without them on touch screens. */
export function keyLabel(str) {
  return textVariants.length ? hideKeyHints(str) : str;
}

export function t(key, params = {}) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;
  const lookup = (k) => dict[k] ?? TRANSLATIONS.en[k];
  let str = textVariants.map((suffix) => lookup(key + suffix)).find((v) => v != null) ?? lookup(key) ?? key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replaceAll(`{${k}}`, String(v));
  }
  return keyLabel(str);
}

export function getLocalizedLevelText(levelId, targetValue) {
  const langDict = LEVEL_TRANSLATIONS[currentLang] || LEVEL_TRANSLATIONS.fr;
  if (langDict[levelId]) {
    return langDict[levelId];
  }
  const targetStr = String(targetValue).padStart(3, '0');
  if (currentLang === 'fr') {
    return {
      world: `Niveau Infini ${levelId}`,
      name: `Défi Porte ${targetStr}`,
      subtitle: `Atteins exactement ${targetStr} pour ouvrir la porte !`
    };
  }
  return {
    world: `Endless Stage ${levelId}`,
    name: `Target ${targetStr} Challenge`,
    subtitle: `Reach ${targetStr} to unlock the Top Door!`
  };
}
