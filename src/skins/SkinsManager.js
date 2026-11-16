const UNLOCKED_KEY = 'ben_alice_math_attack_unlocked_skins';
const SELECTED_KEY = 'ben_alice_math_attack_selected_skins';

export const SKINS = [
  {
    id: 'classic',
    icon: '👕',
    category: 'sport',
    fr: 'Classique',
    en: 'Classic',
    primary: [239, 68, 68],
    secondary: [37, 99, 235],
    pants: [30, 58, 138],
    shoes: [59, 130, 246],
    sole: [250, 204, 21],
    hat: 'none'
  },
  {
    id: 'banana',
    icon: '🍌',
    category: 'fruit',
    fr: 'Banane',
    en: 'Banana',
    primary: [250, 204, 21],
    secondary: [254, 240, 138],
    pants: [234, 179, 8],
    shoes: [120, 53, 15],
    sole: [250, 204, 21],
    hat: 'banana'
  },
  {
    id: 'panda',
    icon: '🐼',
    category: 'animal',
    fr: 'Panda',
    en: 'Panda',
    primary: [248, 250, 252],
    secondary: [15, 23, 42],
    pants: [15, 23, 42],
    shoes: [15, 23, 42],
    sole: [248, 250, 252],
    hat: 'panda'
  },
  {
    id: 'karate',
    icon: '🥋',
    category: 'sport',
    fr: 'Karaté',
    en: 'Karate',
    primary: [248, 250, 252],
    secondary: [15, 23, 42],
    pants: [226, 232, 240],
    shoes: [239, 68, 68],
    sole: [255, 255, 255],
    hat: 'headband'
  },
  {
    id: 'strawberry',
    icon: '🍓',
    category: 'fruit',
    fr: 'Fraise',
    en: 'Strawberry',
    primary: [225, 29, 72],
    secondary: [253, 224, 71],
    pants: [190, 18, 60],
    shoes: [34, 197, 94],
    sole: [22, 101, 52],
    hat: 'leaf'
  },
  {
    id: 'firefighter',
    icon: '🚒',
    category: 'job',
    fr: 'Pompier',
    en: 'Firefighter',
    primary: [185, 28, 28],
    secondary: [250, 204, 21],
    pants: [30, 41, 59],
    shoes: [239, 68, 68],
    sole: [250, 204, 21],
    hat: 'firefighter'
  },
  {
    id: 'bunny',
    icon: '🐰',
    category: 'animal',
    fr: 'Lapin Rose',
    en: 'Pink Bunny',
    primary: [244, 114, 182],
    secondary: [252, 231, 243],
    pants: [236, 72, 153],
    shoes: [255, 255, 255],
    sole: [244, 114, 182],
    hat: 'bunny'
  },
  {
    id: 'astronaut',
    icon: '🚀',
    category: 'job',
    fr: 'Cosmonaute',
    en: 'Astronaut',
    primary: [226, 232, 240],
    secondary: [56, 189, 248],
    pants: [148, 163, 184],
    shoes: [249, 115, 22],
    sole: [255, 255, 255],
    hat: 'visor'
  },
  {
    id: 'basketball',
    icon: '🏀',
    category: 'sport',
    fr: 'Basket',
    en: 'Basketball',
    primary: [250, 204, 21],
    secondary: [126, 34, 206],
    pants: [107, 33, 168],
    shoes: [249, 115, 22],
    sole: [255, 255, 255],
    hat: 'sweatband'
  },
  {
    id: 'pineapple',
    icon: '🍍',
    category: 'fruit',
    fr: 'Ananas',
    en: 'Pineapple',
    primary: [234, 179, 8],
    secondary: [161, 98, 7],
    pants: [202, 138, 4],
    shoes: [22, 163, 74],
    sole: [250, 204, 21],
    hat: 'pineapple'
  },
  {
    id: 'frog_suit',
    icon: '🐸',
    category: 'animal',
    fr: 'Grenouille',
    en: 'Frog',
    primary: [34, 197, 94],
    secondary: [187, 247, 208],
    pants: [21, 128, 61],
    shoes: [22, 101, 52],
    sole: [134, 239, 172],
    hat: 'frog_eyes'
  },
  {
    id: 'chef',
    icon: '👨‍🍳',
    category: 'job',
    fr: 'Chef Pâtissier',
    en: 'Master Chef',
    primary: [255, 255, 255],
    secondary: [239, 68, 68],
    pants: [51, 65, 85],
    shoes: [15, 23, 42],
    sole: [226, 232, 240],
    hat: 'chef'
  },
  {
    id: 'watermelon',
    icon: '🍉',
    category: 'fruit',
    fr: 'Pastèque',
    en: 'Watermelon',
    primary: [244, 63, 94],
    secondary: [22, 163, 74],
    pants: [21, 128, 61],
    shoes: [20, 83, 45],
    sole: [134, 239, 172],
    hat: 'melon'
  },
  {
    id: 'tennis',
    icon: '🎾',
    category: 'sport',
    fr: 'Tennis',
    en: 'Tennis Pro',
    primary: [248, 250, 252],
    secondary: [34, 197, 94],
    pants: [22, 163, 74],
    shoes: [255, 255, 255],
    sole: [132, 204, 22],
    hat: 'tennis_visor'
  },
  {
    id: 'cat',
    icon: '🐱',
    category: 'animal',
    fr: 'Chaton Doré',
    en: 'Golden Kitten',
    primary: [249, 115, 22],
    secondary: [254, 215, 170],
    pants: [234, 88, 12],
    shoes: [255, 255, 255],
    sole: [249, 115, 22],
    hat: 'cat_ears'
  },
  {
    id: 'pirate',
    icon: '🏴‍☠️',
    category: 'job',
    fr: 'Pirate',
    en: 'Pirate',
    primary: [185, 28, 28],
    secondary: [250, 204, 21],
    pants: [30, 41, 59],
    shoes: [120, 53, 15],
    sole: [250, 204, 21],
    hat: 'pirate'
  },
  {
    id: 'orange_fruit',
    icon: '🍊',
    category: 'fruit',
    fr: 'Orange',
    en: 'Orange',
    primary: [249, 115, 22],
    secondary: [253, 186, 116],
    pants: [234, 88, 12],
    shoes: [22, 163, 74],
    sole: [249, 115, 22],
    hat: 'orange_leaf'
  },
  {
    id: 'skier',
    icon: '⛷️',
    category: 'sport',
    fr: 'Skieur',
    en: 'Alpine Skier',
    primary: [14, 165, 233],
    secondary: [236, 72, 153],
    pants: [2, 132, 199],
    shoes: [248, 250, 252],
    sole: [236, 72, 153],
    hat: 'beanie'
  },
  {
    id: 'wizard',
    icon: '🧙‍♂️',
    category: 'job',
    fr: 'Magicien',
    en: 'Wizard',
    primary: [109, 40, 217],
    secondary: [250, 204, 21],
    pants: [76, 29, 149],
    shoes: [250, 204, 21],
    sole: [109, 40, 217],
    hat: 'wizard'
  },
  {
    id: 'grape',
    icon: '🍇',
    category: 'fruit',
    fr: 'Raisin',
    en: 'Grape',
    primary: [147, 51, 234],
    secondary: [216, 180, 254],
    pants: [107, 33, 168],
    shoes: [34, 197, 94],
    sole: [147, 51, 234],
    hat: 'leaf'
  }
];

let unlockedIds = ['classic', 'banana', 'panda', 'karate'];
let selectedSkins = { p1: 'classic', p2: 'classic' };

try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const rawUnlocked = window.localStorage.getItem(UNLOCKED_KEY);
    if (rawUnlocked) {
      const parsed = JSON.parse(rawUnlocked);
      if (Array.isArray(parsed) && parsed.length > 0) {
        unlockedIds = Array.from(new Set(['classic', ...parsed]));
      }
    }
    const rawSelected = window.localStorage.getItem(SELECTED_KEY);
    if (rawSelected) {
      const parsedSel = JSON.parse(rawSelected);
      if (parsedSel && typeof parsedSel === 'object') {
        if (SKINS.some((s) => s.id === parsedSel.p1)) selectedSkins.p1 = parsedSel.p1;
        if (SKINS.some((s) => s.id === parsedSel.p2)) selectedSkins.p2 = parsedSel.p2;
      }
    }
  }
} catch {
  // Ignore storage errors
}

function saveSkinState() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlockedIds));
      window.localStorage.setItem(SELECTED_KEY, JSON.stringify(selectedSkins));
    }
  } catch {
    // Ignore storage errors
  }
}

export function getUnlockedSkins() {
  return SKINS.filter((s) => unlockedIds.includes(s.id));
}

export function unlockAllSkins() {
  unlockedIds = SKINS.map((s) => s.id);
  saveSkinState();
  return getUnlockedSkins();
}

export function isSkinUnlocked(skinId) {
  return unlockedIds.includes(skinId);
}

export function getSelectedSkinId(prefix = 'p1') {
  const id = selectedSkins[prefix] || 'classic';
  return unlockedIds.includes(id) ? id : 'classic';
}

export function getSelectedSkinInfo(prefix = 'p1') {
  const id = getSelectedSkinId(prefix);
  return SKINS.find((s) => s.id === id) || SKINS[0];
}

export function setSelectedSkin(prefix, skinId) {
  if (SKINS.some((s) => s.id === skinId) && unlockedIds.includes(skinId)) {
    selectedSkins[prefix] = skinId;
    saveSkinState();
  }
  return getSelectedSkinInfo(prefix);
}

export function cycleSelectedSkin(prefix = 'p1', delta = 1) {
  const unlocked = getUnlockedSkins();
  if (unlocked.length === 0) return SKINS[0];
  const currentId = getSelectedSkinId(prefix);
  const idx = Math.max(0, unlocked.findIndex((s) => s.id === currentId));
  const nextIdx = (idx + delta + unlocked.length) % unlocked.length;
  selectedSkins[prefix] = unlocked[nextIdx].id;
  saveSkinState();
  return unlocked[nextIdx];
}

/**
 * Unlocks the next locked skin upon winning a level and automatically equips it (or returns it for celebration).
 */
export function unlockNextSkinOnVictory() {
  const locked = SKINS.filter((s) => !unlockedIds.includes(s.id));
  if (locked.length === 0) {
    return null;
  }
  const newlyUnlocked = locked[0];
  unlockedIds.push(newlyUnlocked.id);
  saveSkinState();
  return newlyUnlocked;
}

export function getSkinTextureKey(prefix, pose, skinId = null) {
  const sId = skinId || getSelectedSkinId(prefix);
  return `${prefix}-${sId}-${pose}`;
}

/**
 * Generates crisp 140x170 (35x42 grid @ 4x4 pixel blocks) 16-bit Pixel-Art textures
 * for all 8 skins x 2 characters (Ben & Alice) x 5 poses (front, right, left, walk, ouch).
 */
export function generateAllSkinTextures(scene) {
  const poses = ['front', 'right', 'left', 'walk', 'ouch'];
  for (const skin of SKINS) {
    for (const prefix of ['p1', 'p2']) {
      const isGirl = prefix === 'p2';
      for (const pose of poses) {
        const key = `${prefix}-${skin.id}-${pose}`;
        if (!scene.textures.exists(key)) {
          _buildSinglePixelSprite(scene, key, isGirl, pose, skin);
        }
      }
    }
  }
}

function _buildSinglePixelSprite(scene, texKey, isGirl, pose, skin) {
  const gridW = 35;
  const gridH = 42;
  const blockSize = 4;
  const outW = 140;
  const outH = 170;

  const grid = new Array(gridW * gridH).fill(null);
  const setCell = (x, y, rgb) => {
    if (x >= 0 && x < gridW && y >= 0 && y < gridH) {
      grid[y * gridW + x] = rgb;
    }
  };
  const fillRect = (x1, y1, x2, y2, rgb) => {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        setCell(x, y, rgb);
      }
    }
  };

  const OUTL = [15, 23, 42];
  const WHITE = [255, 255, 255];
  const SKIN = [255, 224, 198];
  const SKINS = [244, 198, 166];
  const RED1 = [255, 115, 115];
  const RED2 = [239, 68, 68];
  const BLUSH = [251, 146, 180];
  const TEAR = [56, 189, 248];
  const HAIR1 = [146, 96, 56];
  const HAIR2 = [182, 128, 82];
  const HAIRD = [108, 68, 38];

  const isOuch = pose === 'ouch';
  const sMain = isOuch ? RED1 : SKIN;
  const sShade = isOuch ? RED2 : SKINS;

  // Outfit palette
  let topMain = skin.primary;
  let topSec = skin.secondary;
  let sleeveCol = skin.primary;
  let pantsCol = skin.pants;
  let shoeCol = skin.shoes;
  let soleCol = skin.sole;

  if (skin.id === 'classic') {
    if (isGirl) {
      topMain = [34, 150, 75]; // Green vest
      topSec = [244, 114, 182]; // Pink shirt
      sleeveCol = [244, 114, 182];
      pantsCol = [30, 58, 138];
      shoeCol = [147, 197, 253];
      soleCol = [255, 255, 255];
    } else {
      topMain = [239, 68, 68]; // Red jersey
      topSec = [37, 99, 235]; // Blue stripes
      sleeveCol = [239, 68, 68];
      pantsCol = [195, 34, 34];
      shoeCol = [59, 130, 246];
      soleCol = [250, 204, 21];
    }
  }

  // 1. DRAW BODY & LEGS (gy = 23..40)
  if (pose === 'front' || pose === 'ouch') {
    fillRect(13, 23, 21, 31, topMain);
    fillRect(16, 24, 18, 30, topSec);
    if (skin.id === 'karate') {
      fillRect(13, 29, 21, 30, topSec); // Black belt
    } else if (skin.id === 'strawberry' || skin.id === 'watermelon') {
      // Cute fruit seeds on tummy
      setCell(14, 26, topSec);
      setCell(20, 26, topSec);
      setCell(17, 28, topSec);
      setCell(15, 30, topSec);
      setCell(19, 30, topSec);
    }
    // Sleeves & hands
    fillRect(11, 24, 12, 29, sleeveCol);
    fillRect(22, 24, 23, 29, sleeveCol);
    fillRect(11, 30, 12, 31, SKIN);
    fillRect(22, 30, 23, 31, SKIN);
    if (isGirl && skin.id === 'classic') {
      fillRect(14, 23, 20, 23, [250, 204, 21]);
    }
    // Pants / shorts + two separate legs
    fillRect(13, 32, 21, 34, pantsCol);
    fillRect(13, 35, 16, 38, !isGirl && skin.id === 'classic' ? SKIN : pantsCol);
    fillRect(18, 35, 21, 38, !isGirl && skin.id === 'classic' ? SKIN : pantsCol);
    // Shoes
    fillRect(13, 39, 16, 39, shoeCol);
    fillRect(13, 40, 16, 40, soleCol);
    fillRect(18, 39, 21, 39, shoeCol);
    fillRect(18, 40, 21, 40, soleCol);
  } else if (pose === 'right' || pose === 'left') {
    fillRect(14, 23, 20, 31, topMain);
    fillRect(16, 25, 18, 29, topSec);
    fillRect(16, 29, 18, 31, SKIN);
    fillRect(14, 32, 20, 34, pantsCol);
    fillRect(14, 35, 16, 38, !isGirl && skin.id === 'classic' ? SKINS : pantsCol);
    fillRect(18, 35, 20, 38, !isGirl && skin.id === 'classic' ? SKIN : pantsCol);
    fillRect(14, 39, 16, 39, shoeCol);
    fillRect(14, 40, 16, 40, soleCol);
    fillRect(18, 39, 20, 39, shoeCol);
    fillRect(18, 40, 20, 40, soleCol);
  } else if (pose === 'walk') {
    fillRect(14, 23, 20, 31, topMain);
    fillRect(16, 25, 18, 29, topSec);
    // Swinging arms
    fillRect(12, 25, 13, 28, sleeveCol);
    setCell(12, 29, SKIN);
    fillRect(21, 25, 22, 28, sleeveCol);
    setCell(22, 29, SKIN);
    // Stride legs
    fillRect(14, 32, 20, 34, pantsCol);
    const legCol = !isGirl && skin.id === 'classic' ? SKIN : pantsCol;
    fillRect(12, 35, 15, 36, legCol);
    fillRect(11, 37, 14, 38, legCol);
    fillRect(10, 39, 13, 39, shoeCol);
    fillRect(10, 40, 13, 40, soleCol);

    fillRect(19, 35, 21, 36, legCol);
    fillRect(20, 37, 22, 38, legCol);
    fillRect(20, 39, 23, 39, shoeCol);
    fillRect(20, 40, 23, 40, soleCol);
  }

  // 2. DRAW BIG HEAD (gy = 4..22)
  const cx = 17;
  const cy = 13;
  const rx = isOuch ? 9.2 : 8.2;
  const ry = isOuch ? 9.8 : 9.0;

  for (let gy = 4; gy <= 22; gy++) {
    for (let gx = 7; gx <= 27; gx++) {
      const dx = (gx - cx) / rx;
      const dy = (gy - cy) / ry;
      if (dx * dx + dy * dy <= 1.0) {
        setCell(gx, gy, gy >= 20 ? sShade : sMain);
      }
    }
  }

  // Hair
  for (let gy = 4; gy <= 9; gy++) {
    for (let gx = 8; gx <= 26; gx++) {
      const dx = (gx - cx) / (rx + 0.4);
      const dy = (gy - (cy - 1)) / ry;
      if (dx * dx + dy * dy <= 1.0) {
        setCell(gx, gy, gy <= 5 && gx >= 14 && gx <= 20 ? HAIR2 : HAIR1);
      }
    }
  }
  if (!isGirl) {
    for (const gx of [10, 11, 13, 14, 16, 17, 19, 20, 22, 23]) {
      if (grid[10 * gridW + gx]) setCell(gx, 10, HAIR1);
    }
    if (pose === 'right' || pose === 'walk') {
      fillRect(9, 7, 13, 16, HAIR1);
    } else if (pose === 'left') {
      fillRect(21, 7, 25, 16, HAIR1);
    }
  } else {
    if (pose === 'front' || pose === 'ouch') {
      fillRect(8, 8, 9, 22, HAIR1);
      fillRect(25, 8, 26, 22, HAIR1);
    } else if (pose === 'right' || pose === 'walk') {
      fillRect(8, 6, 14, 22, HAIR1);
    } else if (pose === 'left') {
      fillRect(20, 6, 26, 22, HAIR1);
    }
  }

  // 3. DRAW SKIN HAT / HEADGEAR ACCESSORY!
  if (skin.hat === 'banana') {
    // Giant Banana hood/hat on top & sides of head + brown stem tip at top!
    fillRect(11, 3, 23, 6, [250, 204, 21]);
    fillRect(14, 2, 20, 3, [254, 240, 138]);
    fillRect(16, 1, 18, 2, [120, 53, 15]); // Brown banana tip
    fillRect(8, 7, 10, 19, [250, 204, 21]);
    fillRect(24, 7, 26, 19, [250, 204, 21]);
  } else if (skin.hat === 'headband') {
    // Red karate headband across forehead!
    fillRect(9, 8, 25, 9, [239, 68, 68]);
    setCell(17, 8, WHITE);
    setCell(7, 9, [239, 68, 68]);
    setCell(6, 10, [239, 68, 68]);
  } else if (skin.hat === 'leaf') {
    // Green strawberry leaf crown on top of head!
    fillRect(11, 3, 23, 5, [34, 197, 94]);
    fillRect(16, 1, 18, 3, [21, 128, 61]);
    setCell(10, 6, [34, 197, 94]);
    setCell(17, 6, [34, 197, 94]);
    setCell(24, 6, [34, 197, 94]);
  } else if (skin.hat === 'visor') {
    // White & cyan space helmet rim!
    fillRect(10, 2, 24, 5, [226, 232, 240]);
    fillRect(13, 4, 21, 5, [56, 189, 248]);
    fillRect(8, 6, 9, 19, [226, 232, 240]);
    fillRect(25, 6, 26, 19, [226, 232, 240]);
  } else if (skin.hat === 'sweatband') {
    // Purple & gold basketball sweatband!
    fillRect(9, 8, 25, 9, [126, 34, 206]);
    fillRect(12, 8, 22, 8, [250, 204, 21]);
  } else if (skin.hat === 'melon') {
    // Green striped watermelon cap!
    fillRect(10, 3, 24, 6, [22, 163, 74]);
    for (let x = 11; x <= 23; x += 3) {
      fillRect(x, 3, x, 6, [20, 83, 45]);
    }
  } else if (skin.hat === 'pirate') {
    // Classic black Pirate Tricorne Hat with gold trim!
    fillRect(7, 5, 27, 7, [15, 23, 42]);
    fillRect(10, 2, 24, 5, [30, 41, 59]);
    fillRect(10, 2, 24, 2, [250, 204, 21]);
    fillRect(16, 4, 18, 5, [250, 204, 21]);
  } else if (skin.hat === 'panda') {
    // Cute round black Panda ears + white top hood!
    fillRect(10, 3, 24, 6, [248, 250, 252]);
    fillRect(7, 2, 11, 6, [15, 23, 42]);
    fillRect(23, 2, 27, 6, [15, 23, 42]);
  } else if (skin.hat === 'bunny') {
    // Tall pink & white Bunny ears!
    fillRect(11, 0, 14, 6, [244, 114, 182]);
    fillRect(12, 1, 13, 5, [252, 231, 243]);
    fillRect(20, 0, 23, 6, [244, 114, 182]);
    fillRect(21, 1, 22, 5, [252, 231, 243]);
  } else if (skin.hat === 'frog_eyes') {
    // Green Frog hood with two big white & black frog eyes on top!
    fillRect(10, 4, 24, 6, [34, 197, 94]);
    fillRect(10, 1, 14, 4, [34, 197, 94]);
    fillRect(11, 2, 13, 3, WHITE);
    setCell(12, 3, OUTL);
    fillRect(20, 1, 24, 4, [34, 197, 94]);
    fillRect(21, 2, 23, 3, WHITE);
    setCell(22, 3, OUTL);
  } else if (skin.hat === 'cat_ears') {
    // Pointed golden Cat ears with pink inner triangles!
    fillRect(9, 2, 13, 6, [249, 115, 22]);
    setCell(11, 4, [244, 114, 182]);
    fillRect(21, 2, 25, 6, [249, 115, 22]);
    setCell(23, 4, [244, 114, 182]);
  } else if (skin.hat === 'firefighter') {
    // Red Firefighter helmet with yellow badge & wide brim!
    fillRect(8, 5, 26, 6, [185, 28, 28]);
    fillRect(11, 2, 23, 5, [220, 38, 38]);
    fillRect(16, 3, 18, 4, [250, 204, 21]);
  } else if (skin.hat === 'chef') {
    // Tall white Chef Toque!
    fillRect(10, 0, 24, 4, WHITE);
    fillRect(11, 4, 23, 6, [226, 232, 240]);
  } else if (skin.hat === 'wizard') {
    // Pointed purple & gold Wizard Hat!
    fillRect(7, 6, 27, 7, [109, 40, 217]);
    fillRect(11, 3, 23, 6, [126, 34, 206]);
    fillRect(14, 1, 20, 3, [109, 40, 217]);
    setCell(17, 0, [250, 204, 21]);
    setCell(15, 4, [250, 204, 21]);
    setCell(19, 5, [250, 204, 21]);
  } else if (skin.hat === 'pineapple') {
    // Spiky green Pineapple crown!
    fillRect(11, 4, 23, 6, [250, 204, 21]);
    fillRect(12, 2, 22, 4, [22, 163, 74]);
    setCell(11, 1, [34, 197, 94]);
    setCell(15, 0, [34, 197, 94]);
    setCell(17, 0, [21, 128, 61]);
    setCell(19, 0, [34, 197, 94]);
    setCell(23, 1, [34, 197, 94]);
  } else if (skin.hat === 'orange_leaf') {
    // Orange cap with bright green leaf on top!
    fillRect(11, 3, 23, 6, [249, 115, 22]);
    fillRect(17, 1, 22, 3, [34, 197, 94]);
    setCell(16, 2, [120, 53, 15]);
  } else if (skin.hat === 'tennis_visor') {
    // Crisp white & green Tennis Visor!
    fillRect(9, 6, 25, 8, WHITE);
    fillRect(8, 8, 26, 9, [34, 197, 94]);
  } else if (skin.hat === 'beanie') {
    // Cyan & pink winter ski beanie with white pom-pom!
    fillRect(10, 3, 24, 7, [14, 165, 233]);
    fillRect(9, 6, 25, 7, [236, 72, 153]);
    fillRect(15, 0, 19, 2, WHITE);
  }

  // 4. FACIAL FEATURES
  if (isOuch) {
    setCell(13, 13, OUTL);
    setCell(14, 14, OUTL);
    setCell(13, 15, OUTL);
    setCell(21, 13, OUTL);
    setCell(20, 14, OUTL);
    setCell(21, 15, OUTL);
    for (let ty = 15; ty <= 20; ty++) {
      setCell(11, ty, TEAR);
      setCell(12, ty, TEAR);
      setCell(22, ty, TEAR);
      setCell(23, ty, TEAR);
    }
    for (let mx = 15; mx <= 19; mx++) {
      setCell(mx, 17, OUTL);
      setCell(mx, 18, WHITE);
      setCell(mx, 19, OUTL);
    }
  } else if (pose === 'front') {
    setCell(13, 13, WHITE);
    setCell(14, 13, OUTL);
    setCell(13, 14, OUTL);
    setCell(14, 14, OUTL);
    setCell(20, 13, WHITE);
    setCell(21, 13, OUTL);
    setCell(20, 14, OUTL);
    setCell(21, 14, OUTL);
    setCell(11, 15, BLUSH);
    setCell(12, 15, BLUSH);
    setCell(22, 15, BLUSH);
    setCell(23, 15, BLUSH);
    setCell(15, 17, OUTL);
    setCell(16, 18, OUTL);
    setCell(17, 18, OUTL);
    setCell(18, 18, OUTL);
    setCell(19, 17, OUTL);
  } else if (pose === 'right' || pose === 'walk') {
    setCell(20, 13, WHITE);
    setCell(21, 13, OUTL);
    setCell(20, 14, OUTL);
    setCell(21, 14, OUTL);
    setCell(18, 15, BLUSH);
    setCell(19, 15, BLUSH);
    setCell(20, 17, OUTL);
    setCell(21, 18, OUTL);
    setCell(22, 18, OUTL);
    setCell(23, 17, OUTL);
  } else if (pose === 'left') {
    setCell(13, 13, OUTL);
    setCell(14, 13, WHITE);
    setCell(13, 14, OUTL);
    setCell(14, 14, OUTL);
    setCell(15, 15, BLUSH);
    setCell(16, 15, BLUSH);
    setCell(11, 17, OUTL);
    setCell(12, 18, OUTL);
    setCell(13, 18, OUTL);
    setCell(14, 17, OUTL);
  }

  // 5. ADD CRISP 1-CELL DARK PIXEL-ART CONTOUR
  const outlined = [...grid];
  for (let gy = 1; gy < gridH - 1; gy++) {
    for (let gx = 1; gx < gridW - 1; gx++) {
      if (!grid[gy * gridW + gx]) {
        const hasNeighbor =
          grid[(gy - 1) * gridW + gx] ||
          grid[(gy + 1) * gridW + gx] ||
          grid[gy * gridW + (gx - 1)] ||
          grid[gy * gridW + (gx + 1)];
        if (hasNeighbor) {
          outlined[gy * gridW + gx] = OUTL;
        }
      }
    }
  }

  // 6. RENDER TO PHASER GRAPHICS & GENERATE TEXTURE
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const rgb = outlined[gy * gridW + gx];
      if (!rgb) continue;
      const hexColor = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
      g.fillStyle(hexColor, 1);
      g.fillRect(gx * blockSize, gy * blockSize + 1, blockSize, blockSize);
    }
  }
  g.generateTexture(texKey, outW, outH);
  g.destroy();
}
