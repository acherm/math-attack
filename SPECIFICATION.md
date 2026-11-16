# Calculation Engine & Gameplay Specification (`SPECIFICATION.md`)

This document specifies the mathematical rules, bubble-generation algorithms, operator-precedence hint formatting, and level-design geometry constraints for **Ben & Alice's Math Attack** (*Ben & Alice : l'Attaque des Maths*).
The reference implementation lives in `src/math/MathEngine.js`, `src/levels/levels.js`, and `src/scenes/GameScene.js`, and is automatically validated by `test/MathEngine.test.js`.

---

## 1. Counter & Target Door (`000` to `999`)

1. **Starting Value (`startValue`)**:
   - Every stage **always starts at `000`** (`startValue = 0`).
2. **Door Target Value (`targetValue`)**:
   - Displayed on the exit door as a 3-digit number (`000` to `999`), color-coded by place value (Hundreds in pink, Tens in sky blue, Ones in yellow).
   - Randomly generated at the start of every stage (`generateRandomTarget`) within the stage's target range:
     - **Stages 1 to 4 (Introductory `< 100`)**:
       - Stage 1: `006` to `029`
       - Stage 2: `015` to `059`
       - Stage 3: `020` to `099`
       - Stage 4: `015` to `099`
     - **Stages 5 to 8 (Progression up to `999`)**:
       - Stage 5: `100` to `300`
       - Stage 6: `100` to `450`
       - Stage 7: `150` to `650`
       - Stage 8: `100` to `999`
     - **Stages 9+ (Endless Remix)**:
       - Cycles through the 8 stage layouts in order with random targets in `015` to `999`.
3. **Door Unlocking & Victory Condition**:
   - The exit door unlocks immediately when `currentValue === targetValue`.
   - If an accepted operation bubble, monster side-bump, or trap changes `currentValue` before the player enters the open door, the door locks again immediately (rejected bubbles and top-down monster stomps do not change `currentValue`).
   - In **2-Player Co-op mode (`2p-coop`)**, both players share a single team counter and **both players must pass through the open door** to clear the stage. If the second player changes the team number while the first player is waiting inside the door, the door locks again and the first player pops back out.

---

## 2. Mathematical Operations & `1`–`10` Operands

To encourage genuine mental arithmetic (addition, subtraction, multiplication, and division tables), **all operation bubbles exclusively use integers from `1` to `10`** (`ALL_BUBBLE_OPS_1_TO_10`):

| Operator | Color | Allowed Bubbles | Evaluation Rule |
| :--- | :--- | :--- | :--- |
| **Addition (`+`)** | Green (`#22c55e`) | `+1` to `+10` | `next = current + n` (rejected if `next > SmartMaxLimit`) |
| **Subtraction (`-`)** | Blue (`#3b82f6`) | `-1` to `-10` | `next = max(0, current - n)` (clamped at `000`, never negative) |
| **Multiplication (`×`)** | Orange (`#f97316`) | `×2` to `×10` | `next = current × n` (rejected if `next > SmartMaxLimit`) |
| **Division (`÷`)** | Purple (`#a855f7`) | `÷2` to `÷10` | Accepted **only if evenly divisible** (`current % n === 0`). Evenly divisible `÷` bubbles glow with a green halo; non-divisible ones bounce off with a remainder message. |

### Progressive Operand Pools by Stage (`bubblePool`)
- **Stage 1**: `+1`..`+9`, `-1`..`-5`
- **Stage 2**: `+1`..`+10`, `-1`..`-6`, `×2`, `÷2`
- **Stage 3**: `+1`..`+9`, `-1`..`-7`, `×2`..`×4`, `÷2`..`÷3`
- **Stage 4**: `+1`..`+10`, `-1`..`-8`, `×2`..`×5`, `÷2`..`÷4`
- **Stage 5**: `+1`..`+10`, `-1`..`-9`, `×2`..`×6`, `÷2`..`÷5`
- **Stage 6**: `+1`..`+10`, `-1`..`-9`, `×2`..`×7`, `÷2`..`÷6`
- **Stage 7**: `+1`..`+10`, `-1`..`-10`, `×2`..`×9`, `÷2`..`÷7`
- **Stage 8**: `+1`..`+10`, `-1`..`-10`, `×2`..`×10`, `÷2`..`÷10`

---

## 3. Overshoot Protection & Recovery (3 Combined Rules)

To prevent players from multiplying far past the target and getting stuck with small `-1`..`-10` subtractions or unusable divisions:

### Rule A — Smart Door-Linked Ceiling (`getSmartMaxLimit`)
- Any addition or multiplication that would exceed the **Smart Ceiling** is rejected (the bubble bounces off with a *"Too High!"* warning):
  $$\text{SmartMaxLimit} = \begin{cases} \min\left(999,\ \max\left(\text{targetValue} + 25,\ \lceil \text{targetValue} \times 1.45 \rceil\right)\right) & \text{if } \text{targetValue} < 700 \\ 999 & \text{if } \text{targetValue} \ge 700 \end{cases}$$
- *Example*: For a door target of `028`, the smart ceiling is `053`. If the player is at `020` and touches `×3` (`= 060`), the operation is rejected instead of sending the number far above the target.

### Rule B — Smart Divisors & Prime-Number Unblocking (`getSmartOvershootBubble`)
When `currentValue > targetValue`:
1. If `currentValue - targetValue >= 12`, the engine searches $d \in [2..10]$ in ascending order for the first exact divisor (`currentValue % d === 0`) whose quotient `q = currentValue / d` satisfies `|targetValue - q| < currentValue - targetValue` and `q >= floor(targetValue * 0.35)`, returning **`÷d`**.
2. Otherwise, if `currentValue - targetValue >= 12`, it searches $k \in [1..5]$ in ascending order for the first subtraction **`-k`** where `nextVal = currentValue - k` has a divisor $d \in [2..10]$ with `|targetValue - nextVal / d| < currentValue - targetValue`.
3. When the overshoot is small ($4 \le \text{diff} \le 10$), the engine returns `-ceil(diff / 2)` so the player performs a 2-step calculation; otherwise it falls back to `-min(10, max(1, diff))`.

### Rule C — Dynamic In-Place Bubble Morphing (`_syncBubblesForOvershootState`)
Whenever the counter changes (except immediately after a `? HELP / AIDE` hint morphs its required step bubbles):
- **When `currentValue > targetValue`**:
  - All active `×` bubbles, all `÷` bubbles that do not evenly divide `currentValue`, and any excess `+` bubbles (beyond 2) on screen **immediately morph in place** (`_morphBubblePickup`) into `getSmartOvershootBubble()` (which may introduce an exact `÷d` divisor outside the stage's base `bubblePool`) and `-` bubbles.
- **When `currentValue < targetValue`**:
  - Active `÷` bubbles, `×` bubbles that would exceed `getSmartMaxLimit()` (or are useless at `000`), and excess `-` bubbles (beyond 2) morph into `+` bubbles.

---

## 4. Bubble Respawn Algorithm (Anti-Camping)

When a bubble is collected, a replacement bubble spawns after `2.6 s` according to two rules:

1. **Distant Free Slot Selection (`_pickDistantFreeSlot`)**:
   - Every stage defines more candidate bubble slots (`allBubbleSlots`, $\ge 8$ per stage) than active bubbles (`6`).
   - A respawning bubble filters out occupied slots and the just-collected slot, then randomly selects one of the **2 unoccupied slots farthest from the player**, requiring movement across the arena.
2. **Varied Pool Selection (`_pickVariedPoolBubble`)**:
   - When `currentValue > targetValue`, prioritizes `getSmartOvershootBubble()` (if not already on screen) or valid exact divisors and `-` bubbles from `bubblePool`.
   - When `currentValue < targetValue`:
     - Ensures at least one small unit bubble (`+1`, `+2`, `-1`, `-2`) is present on the map.
     - For general pool draws, excludes `previousLabel`, excludes the 1-step exact remainder (`+(targetValue - currentValue)`), excludes `÷` bubbles, and excludes `×` bubbles that would exceed `getSmartMaxLimit()`.

---

## 5. `? HELP / AIDE` Brick & Operator-Precedence Formatting (`getHintSolution`)

Bumping the yellow **`? HELP / AIDE`** brick (`type: 'mystery'`) from below:
1. **Never spawns a physical bubble**.
2. Computes a **mathematical solution path** from `currentValue` to `targetValue` respecting `getSmartMaxLimit()` and non-negative subtraction (`cur - value >= 0`):
   - First searches via Breadth-First Search (BFS) for a 1-to-3 step path using only the bubbles currently active on screen (`activeLabels`).
   - Otherwise computes the shortest BFS path using the stage's `bubblePool` (`1`..`10` operands), splitting a single additive/subtractive step $\ge 4$ into two smaller steps, and morphs any missing step onto existing screen bubbles (skipping `_syncBubblesForOvershootState` on that tick so the morphed hint bubbles are preserved).
3. **Explicit Operator-Precedence Parentheses (`_formatHintFormula`)**:
   - Uses a single space around every operator and `=`.
   - When starting at `000`, omits the redundant leading `0 +` from the displayed formula only; the first addition remains in the solution's bubble steps.
   - Whenever the operator changes or involves multiplication/division (`×` or `÷`), the preceding sub-expression is wrapped in **explicit parentheses** so order of operations is unambiguous:
     - Pure additions: `8 + 7 = 15`
     - Addition then subtraction: `(9 + 6) - 2 = 13`
     - Multiplication then addition: `(6 × 3) + 4 = 22`
     - Addition then multiplication: `(6 + 4) × 3 = 30`
     - Three mixed steps: `(6 × 3) + 4 = 22`
4. Displays the formula in a high-contrast banner at the top-center of the arena as well as in the top HUD bar.

---

## 6. Level Design Geometry Constraints (Enforced by Automated Tests)

All 8 campaign stages (`src/levels/levels.js`) are validated by `test/MathEngine.test.js` against 4 geometry invariants:
1. **Door & Platform Reachability Graph**: Every platform and the top door platform (`platforms[0]`) must be reachable in the platform adjacency graph starting from the ground floor (`y = 507`) via edges with `dy <= 96 px`, horizontal edge-to-edge gap `<= 130 px`, and no target platform spanning directly overhead.
2. **Brick Clearance (`AIDE/HELP`, `RETOUR/UNDO`, `ZÉRO/000`)**: Every brick must have a standing surface directly underneath with `105` to `122 px` vertical center-to-surface-top distance (`83` to `100 px` floor-to-brick-bottom clearance, leaving `~23` to `40 px` above the `60 px`-tall player) and at least `65 px` open space above.
3. **No Bubbles or Traps Under Bricks**:
   - No bubble slot (`allBubbleSlots`) may sit within `|x - brick.x| < 75 px` and `y ∈ [brick.y - 30, brick.y + 135]`.
   - No trap (`spikes`, `fireball`) may sit within `120 px` horizontally (`|trap.x - brick.x| >= 120 px`) of any brick.
4. **Safe Player Spawn Zone**: No `spikes` trap may be placed within `200 px` horizontally of any player spawn point (`x = 350, 430, 610`).

