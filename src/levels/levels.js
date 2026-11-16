import { MathCounter, generateRandomTarget } from '../math/MathEngine.js';

/**
 * 8 Unique Campaign Stages for Ben & Alice's Math Attack!
 * - Each stage has its own distinct platform layout, door position, and visual decor theme!
 * - Levels 1 to 4: Random Door Targets < 100 (005..099)
 * - Levels 5 to 8: Random Door Targets up to 999 (100..999)
 * - Multipliers only use ×2 or ×3 (never ×10), and initial bubbles ALWAYS include a complete winning path!
 */
export const LEVELS = [
  {
    id: 1,
    decor: 'meadow',
    world: 'World 1-1 • Sunny Meadow',
    name: 'La Pyramide des Prés (< 030)',
    subtitle: 'Grimpe la pyramide et attrape les bulles pour ouvrir la porte (< 030) !',
    startValue: 0,
    minTarget: 6,
    maxTarget: 29,
    targetRangeLabel: '006–029',
    targetValue: 14,
    initialOperator: '+',
    parSteps: 4,
    skyTop: 0x38bdf8,
    skyBottom: 0xe0f2fe,
    hillColor: 0x4ade80,
    platColor: 0x92400e,
    platTopColor: 0x22c55e,
    doorX: 480,
    doorY: 102,
    bubblePool: ['+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1', '-5', '-4', '-3', '-2', '-1'],
    platforms: [
      { x: 480, y: 140, width: 210 }, // Top door platform (center)
      { x: 260, y: 235, width: 180 }, // Mid-upper left step
      { x: 700, y: 235, width: 180 }, // Mid-upper right step
      { x: 160, y: 330, width: 170 }, // Mid-lower left step
      { x: 520, y: 330, width: 200 }, // Mid-lower center-right step
      { x: 800, y: 330, width: 170 }, // Mid-lower right step
      { x: 140, y: 425, width: 170 }, // Base left step
      { x: 820, y: 425, width: 170 }  // Base right step
    ],
    bricks: [
      { x: 330, y: 384, type: 'mystery', caption: 'AIDE' }
    ],
    bubbleSlots: [
      { x: 140, y: 378 },
      { x: 820, y: 378 },
      { x: 160, y: 282 },
      { x: 800, y: 282 },
      { x: 260, y: 188 },
      { x: 700, y: 188 }
    ],
    slimes: [
      { kind: 'slime', penalty: 1, x: 520, y: 300, minX: 435, maxX: 605, speed: 55 }
    ],
    traps: []
  },
  {
    id: 2,
    decor: 'beach',
    world: 'World 1-2 • Tropical Beach',
    name: 'L’Escalier de la Plage (< 060)',
    subtitle: 'Monte l’escalier des palmiers jusqu’à la porte en haut à droite !',
    startValue: 0,
    minTarget: 15,
    maxTarget: 59,
    targetRangeLabel: '015–059',
    targetValue: 32,
    initialOperator: '+',
    parSteps: 4,
    skyTop: 0x0284c7,
    skyBottom: 0xfef08a,
    hillColor: 0xfacc15,
    platColor: 0xb45309,
    platTopColor: 0xfde047,
    doorX: 770,
    doorY: 102,
    bubblePool: ['+10', '+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1', '-6', '-5', '-4', '-3', '-2', '-1', '×2', '÷2'],
    platforms: [
      { x: 770, y: 140, width: 210 }, // Top door platform (right!)
      { x: 520, y: 230, width: 220 }, // Upper-middle step
      { x: 290, y: 320, width: 210 }, // Middle-left step
      { x: 760, y: 325, width: 190 }, // Lower-right step
      { x: 150, y: 415, width: 190 }, // Bottom-left start step
      { x: 430, y: 415, width: 180 }  // Bottom-center step
    ],
    bricks: [
      { x: 590, y: 384, type: 'mystery', caption: 'AIDE' },
      { x: 290, y: 198, type: 'undo', caption: 'UNDO' }
    ],
    bubbleSlots: [
      { x: 150, y: 368 },
      { x: 470, y: 368 },
      { x: 760, y: 278 },
      { x: 220, y: 272 },
      { x: 520, y: 182 },
      { x: 830, y: 455 }
    ],
    slimes: [
      { kind: 'crab', penalty: 2, x: 760, y: 295, minX: 680, maxX: 840, speed: 78 },
      { kind: 'crab', penalty: 2, x: 520, y: 200, minX: 430, maxX: 610, speed: 70 }
    ],
    traps: [
      { type: 'spikes', x: 865, y: 488, penalty: 2 }
    ]
  },
  {
    id: 3,
    decor: 'cavern',
    world: 'World 2-1 • Crystal Cavern',
    name: 'Les Tours de Cristal (< 100)',
    subtitle: 'Grimpe les deux tours de cristal vers la porte en haut à gauche !',
    startValue: 0,
    minTarget: 20,
    maxTarget: 99,
    targetRangeLabel: '020–099',
    targetValue: 68,
    initialOperator: '+',
    parSteps: 4,
    skyTop: 0x1e1b4b,
    skyBottom: 0x4c1d95,
    hillColor: 0x7c3aed,
    platColor: 0x312e81,
    platTopColor: 0x38bdf8,
    doorX: 190,
    doorY: 102,
    bubblePool: ['×2', '×3', '×4', '÷2', '÷3', '+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1', '-7', '-6', '-5', '-4', '-3', '-2', '-1'],
    platforms: [
      { x: 190, y: 140, width: 210 }, // Top door platform (left!)
      { x: 460, y: 225, width: 220 }, // High sky bridge
      { x: 200, y: 320, width: 200 }, // Left tower mid
      { x: 760, y: 285, width: 200 }, // Right tower mid
      { x: 520, y: 360, width: 200 }, // Center lower bridge
      { x: 160, y: 415, width: 180 }, // Left tower base
      { x: 790, y: 420, width: 180 }  // Right tower base
    ],
    bricks: [
      { x: 340, y: 384, type: 'mystery', caption: 'AIDE' },
      { x: 760, y: 164, type: 'undo', caption: 'UNDO' }
    ],
    bubbleSlots: [
      { x: 160, y: 368 },
      { x: 790, y: 372 },
      { x: 200, y: 272 },
      { x: 700, y: 238 },
      { x: 460, y: 178 },
      { x: 640, y: 455 }
    ],
    slimes: [
      { kind: 'bat', penalty: 2, x: 460, y: 145, minX: 330, maxX: 620, speed: 85, flyY: 145 },
      { kind: 'slime', penalty: 1, x: 520, y: 330, minX: 435, maxX: 605, speed: 70 }
    ],
    traps: [
      { type: 'spikes', x: 75, y: 488, penalty: 2 }
    ]
  },
  {
    id: 4,
    decor: 'desert',
    world: 'World 2-2 • Sunset Desert',
    name: 'Le Canyon en Zig-Zag (< 100)',
    subtitle: 'Serpente de plateforme en plateforme au milieu des cactus et pyramides !',
    startValue: 0,
    minTarget: 15,
    maxTarget: 99,
    targetRangeLabel: '015–099',
    targetValue: 74,
    initialOperator: '+',
    parSteps: 4,
    skyTop: 0x9a3412,
    skyBottom: 0xfdba74,
    hillColor: 0xd97706,
    platColor: 0x78350f,
    platTopColor: 0xf59e0b,
    doorX: 480,
    doorY: 102,
    bubblePool: ['×2', '×3', '×4', '×5', '÷2', '÷3', '÷4', '+10', '+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1'],
    platforms: [
      { x: 480, y: 140, width: 220 }, // Top center door
      { x: 720, y: 225, width: 220 }, // Zig-zag upper right
      { x: 450, y: 280, width: 200 }, // Zig-zag upper-mid stepping stone
      { x: 200, y: 325, width: 220 }, // Zig-zag middle left
      { x: 660, y: 370, width: 220 }, // Zig-zag lower right
      { x: 380, y: 425, width: 220 }  // Zig-zag base center-left
    ],
    bricks: [
      { x: 200, y: 203, type: 'undo', caption: 'UNDO' },
      { x: 840, y: 384, type: 'mystery', caption: 'AIDE' }
    ],
    bubbleSlots: [
      { x: 380, y: 378 },
      { x: 660, y: 322 },
      { x: 450, y: 232 },
      { x: 720, y: 178 },
      { x: 110, y: 465 },
      { x: 660, y: 465 }
    ],
    slimes: [
      { kind: 'crab', penalty: 2, x: 660, y: 340, minX: 565, maxX: 755, speed: 85 },
      { kind: 'frog', penalty: 3, x: 380, y: 395, minX: 290, maxX: 470, speed: 65 }
    ],
    traps: [
      { type: 'spikes', x: 75, y: 488, penalty: 2 },
      { type: 'fireball', x: 560, y: 260, minY: 160, maxY: 340, speedY: 110, penalty: 3 }
    ]
  },
  {
    id: 5,
    decor: 'snow',
    world: 'World 3-1 • Ice Peaks',
    name: 'Les Îles de Glace (100–300)',
    subtitle: 'Utilise les bulles [×2] et [×3] sur les glaciers pour dépasser 100 !',
    startValue: 0,
    minTarget: 100,
    maxTarget: 300,
    targetRangeLabel: '100–300',
    targetValue: 165,
    initialOperator: '+',
    parSteps: 5,
    skyTop: 0x0f172a,
    skyBottom: 0xbae6fd,
    hillColor: 0xe2e8f0,
    platColor: 0x0369a1,
    platTopColor: 0xe0f2fe,
    doorX: 780,
    doorY: 102,
    bubblePool: ['×2', '×3', '×4', '×5', '×6', '÷2', '÷3', '÷4', '÷5', '+10', '+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1'],
    platforms: [
      { x: 780, y: 140, width: 190 }, // Top door on right glacier
      { x: 530, y: 215, width: 190 }, // High-right stepping island
      { x: 270, y: 245, width: 190 }, // High-left glacier
      { x: 760, y: 305, width: 180 }, // Mid-right island
      { x: 490, y: 335, width: 180 }, // Center island
      { x: 170, y: 350, width: 180 }, // Lower-left island
      { x: 640, y: 420, width: 190 }, // Base right island
      { x: 240, y: 425, width: 190 }  // Base left island
    ],
    bricks: [
      { x: 350, y: 384, type: 'mystery', caption: 'AIDE' },
      { x: 170, y: 228, type: 'undo', caption: 'UNDO' }
    ],
    bubbleSlots: [
      { x: 240, y: 378 },
      { x: 640, y: 372 },
      { x: 760, y: 258 },
      { x: 460, y: 288 },
      { x: 270, y: 198 },
      { x: 530, y: 168 }
    ],
    slimes: [
      { kind: 'slime', penalty: 2, x: 640, y: 390, minX: 560, maxX: 720, speed: 80 },
      { kind: 'bat', penalty: 3, x: 530, y: 145, minX: 330, maxX: 640, speed: 95, flyY: 145 }
    ],
    traps: [
      { type: 'spikes', x: 865, y: 488, penalty: 3 }
    ]
  },
  {
    id: 6,
    decor: 'forest',
    world: 'World 3-2 • Enchanted Forest',
    name: 'La Canopée Enchantée (100–450)',
    subtitle: 'Saute de branche en branche avec les bulles [×2], [×3], [÷2] et [÷3] !',
    startValue: 0,
    minTarget: 100,
    maxTarget: 450,
    targetRangeLabel: '100–450',
    targetValue: 240,
    initialOperator: '+',
    parSteps: 5,
    skyTop: 0x064e3b,
    skyBottom: 0x6ee7b7,
    hillColor: 0x059669,
    platColor: 0x451a03,
    platTopColor: 0x10b981,
    doorX: 190,
    doorY: 102,
    bubblePool: ['×2', '×3', '×4', '×5', '×6', '×7', '÷2', '÷3', '÷4', '÷5', '÷6', '+10', '+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1'],
    platforms: [
      { x: 190, y: 140, width: 210 }, // Top door on left treehouse
      { x: 450, y: 215, width: 210 }, // Upper canopy bridge
      { x: 740, y: 265, width: 200 }, // Right branch
      { x: 220, y: 330, width: 200 }, // Middle-left branch
      { x: 560, y: 345, width: 210 }, // Lower-center branch
      { x: 200, y: 420, width: 200 }, // Forest floor left log
      { x: 760, y: 425, width: 200 }  // Forest floor right log
    ],
    bricks: [
      { x: 380, y: 384, type: 'mystery', caption: 'AIDE' },
      { x: 740, y: 143, type: 'undo', caption: 'UNDO' }
    ],
    bubbleSlots: [
      { x: 200, y: 372 },
      { x: 760, y: 378 },
      { x: 560, y: 298 },
      { x: 220, y: 282 },
      { x: 450, y: 168 },
      { x: 560, y: 465 }
    ],
    slimes: [
      { kind: 'frog', penalty: 5, x: 560, y: 315, minX: 470, maxX: 650, speed: 75 },
      { kind: 'bat', penalty: 3, x: 450, y: 140, minX: 330, maxX: 620, speed: 95, flyY: 140 }
    ],
    traps: [
      { type: 'spikes', x: 75, y: 488, penalty: 3 }
    ]
  },
  {
    id: 7,
    decor: 'volcano',
    world: 'World 4-1 • Lava Fortress',
    name: 'La Forteresse du Volcan (150–650)',
    subtitle: 'Traverse le pont d’obsidienne et combine [×2], [×3] et [+100] !',
    startValue: 0,
    minTarget: 150,
    maxTarget: 650,
    targetRangeLabel: '150–650',
    targetValue: 425,
    initialOperator: '+',
    parSteps: 5,
    skyTop: 0x450a0a,
    skyBottom: 0xf97316,
    hillColor: 0x991b1b,
    platColor: 0x1e293b,
    platTopColor: 0xf59e0b,
    doorX: 480,
    doorY: 102,
    bubblePool: ['×2', '×3', '×4', '×5', '×6', '×7', '×8', '×9', '÷2', '÷3', '÷4', '÷5', '÷6', '÷7', '+10', '+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1'],
    platforms: [
      { x: 480, y: 140, width: 220 }, // Top center volcano altar
      { x: 240, y: 225, width: 190 }, // Upper-left bastion
      { x: 720, y: 225, width: 190 }, // Upper-right bastion
      { x: 480, y: 310, width: 210 }, // Center fortress bridge
      { x: 160, y: 385, width: 190 }, // Lower-left bastion
      { x: 800, y: 385, width: 190 }, // Lower-right bastion
      { x: 520, y: 430, width: 210 }  // Sunken center magma bridge
    ],
    bricks: [
      { x: 330, y: 384, type: 'mystery', caption: 'AIDE' },
      { x: 100, y: 264, type: 'undo', caption: 'UNDO' }
    ],
    bubbleSlots: [
      { x: 520, y: 382 },
      { x: 215, y: 338 },
      { x: 745, y: 338 },
      { x: 480, y: 262 },
      { x: 240, y: 178 },
      { x: 720, y: 178 }
    ],
    slimes: [
      { kind: 'crab', penalty: 5, x: 480, y: 280, minX: 395, maxX: 565, speed: 95 },
      { kind: 'bat', penalty: 5, x: 480, y: 195, minX: 280, maxX: 680, speed: 105, flyY: 195 }
    ],
    traps: [
      { type: 'fireball', x: 885, y: 310, minY: 220, maxY: 430, speedY: 120, penalty: 5 },
      { type: 'spikes', x: 865, y: 488, penalty: 5 }
    ]
  },
  {
    id: 8,
    decor: 'space',
    world: 'World 4-2 • Starlight Galaxy',
    name: 'La Citadelle Galactique (100–999)',
    subtitle: 'Flotte entre les anneaux cosmiques pour ouvrir la Grande Porte (100–999) !',
    startValue: 0,
    minTarget: 100,
    maxTarget: 999,
    targetRangeLabel: '100–999',
    targetValue: 745,
    initialOperator: '+',
    parSteps: 6,
    skyTop: 0x020617,
    skyBottom: 0x1e1b4b,
    hillColor: 0x312e81,
    platColor: 0x3b0764,
    platTopColor: 0xc084fc,
    doorX: 480,
    doorY: 102,
    bubblePool: ['×2', '×3', '×4', '×5', '×6', '×7', '×8', '×9', '×10', '÷2', '÷3', '÷4', '÷5', '÷6', '÷7', '÷8', '÷9', '÷10', '+10', '+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1'],
    platforms: [
      { x: 480, y: 140, width: 220 }, // Top center cosmic gate
      { x: 280, y: 235, width: 170 }, // Upper-left orbit ring
      { x: 680, y: 235, width: 170 }, // Upper-right orbit ring
      { x: 480, y: 330, width: 210 }, // Center nexus platform
      { x: 140, y: 345, width: 170 }, // Mid-left satellite
      { x: 820, y: 345, width: 170 }, // Mid-right satellite
      { x: 320, y: 425, width: 180 }, // Lower-left launchpad
      { x: 640, y: 425, width: 180 }  // Lower-right launchpad
    ],
    bricks: [
      { x: 480, y: 208, type: 'mystery', caption: 'AIDE' },
      { x: 140, y: 224, type: 'undo', caption: 'UNDO' }
    ],
    bubbleSlots: [
      { x: 320, y: 378 },
      { x: 640, y: 378 },
      { x: 280, y: 188 },
      { x: 680, y: 188 },
      { x: 350, y: 465 },
      { x: 610, y: 465 }
    ],
    slimes: [
      { kind: 'bat', penalty: 5, x: 480, y: 195, minX: 280, maxX: 680, speed: 110, flyY: 195 },
      { kind: 'frog', penalty: 5, x: 320, y: 395, minX: 245, maxX: 395, speed: 85 },
      { kind: 'crab', penalty: 5, x: 640, y: 395, minX: 565, maxX: 715, speed: 95 }
    ],
    traps: [
      { type: 'fireball', x: 885, y: 340, minY: 240, maxY: 450, speedY: 130, penalty: 5 },
      { type: 'spikes', x: 865, y: 488, penalty: 5 }
    ]
  }
];

export function getLevelConfig(levelNumber) {
  const idx = (Math.max(1, levelNumber) - 1) % LEVELS.length;
  const copy = structuredClone(LEVELS[idx]);

  // Generate a random door target within the stage's range (< 100 for levels 1-4, up to 999 for later levels)
  const minT = levelNumber > LEVELS.length ? 15 : copy.minTarget;
  const maxT = levelNumber > LEVELS.length ? 999 : copy.maxTarget;
  copy.targetValue = generateRandomTarget(minT, maxT, copy.startValue);
  copy.id = levelNumber;

  // Helper: check if a bubble position (x, y) is underneath or too close to any brick (AIDE, RETOUR, ZÉRO)
  const isNearOrUnderAnyBrick = (sx, sy) =>
    (copy.bricks || []).some(
      (b) => Math.abs(sx - b.x) < 75 && sy >= b.y - 30 && sy <= b.y + 135
    );

  // Filter out any bubbleSlot that sits under a brick
  copy.bubbleSlots = (copy.bubbleSlots || []).filter((s) => !isNearOrUnderAnyBrick(s.x, s.y));

  // Add extra candidate slots across the platforms and open ground (excluding any spot under a brick!)
  const extraCandidates = [
    ...copy.platforms.slice(1).map((p) => ({ x: p.x, y: p.y - 46 })),
    { x: 110, y: 455 },
    { x: 250, y: 455 },
    { x: 480, y: 455 },
    { x: 710, y: 455 },
    { x: 850, y: 455 }
  ];
  const extraSlots = extraCandidates.filter(
    (es) =>
      !isNearOrUnderAnyBrick(es.x, es.y) &&
      !copy.bubbleSlots.some((bs) => Math.hypot(bs.x - es.x, bs.y - es.y) < 55)
  );
  copy.allBubbleSlots = [...copy.bubbleSlots, ...extraSlots];

  // Build a balanced initial mix of 1..10 bubbles across the stage's slots (additions, subtractions, and multipliers)
  const slots = copy.bubbleSlots || [];
  const plusPool = copy.bubblePool.filter((b) => b.startsWith('+'));
  const minusPool = copy.bubblePool.filter((b) => b.startsWith('-'));
  const multDivPool = copy.bubblePool.filter((b) => b.startsWith('×') || b.startsWith('÷'));

  copy.initialBubbles = slots.map((slot, i) => {
    let bubbleLabel = '+5';
    if (i === 0 || i === 1 || (i === 2 && multDivPool.length === 0)) {
      bubbleLabel = plusPool[(i * 2) % plusPool.length] || '+4';
    } else if (i === 3 || (i === 4 && multDivPool.length === 0)) {
      bubbleLabel = minusPool[i % minusPool.length] || '-2';
    } else if (multDivPool.length > 0 && (i === 2 || i === 4)) {
      bubbleLabel = multDivPool[i % multDivPool.length];
    } else {
      bubbleLabel = plusPool[(i + 3) % plusPool.length] || '+3';
    }
    return {
      x: slot.x,
      y: slot.y,
      bubble: bubbleLabel
    };
  });

  return copy;
}
