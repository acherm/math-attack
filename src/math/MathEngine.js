import { t } from '../i18n/i18n.js';

export const MIN_NUMBER = 0;
export const MAX_NUMBER = 999;
export const MIN_OPERAND = 1;
export const MAX_OPERAND = 10;

export const ALL_BUBBLE_OPS_1_TO_10 = [
  ...Array.from({ length: 10 }, (_, i) => ({ op: '+', value: i + 1, label: `+${i + 1}` })),
  ...Array.from({ length: 10 }, (_, i) => ({ op: '-', value: i + 1, label: `-${i + 1}` })),
  ...Array.from({ length: 9 }, (_, i) => ({ op: '×', value: i + 2, label: `×${i + 2}` })),
  ...Array.from({ length: 9 }, (_, i) => ({ op: '÷', value: i + 2, label: `÷${i + 2}` }))
];

export const OPERATORS = {
  '+': {
    symbol: '+',
    name: 'PLUS',
    color: 0x22c55e,
    hex: '#22c55e',
    badgeBg: '#15803d'
  },
  '-': {
    symbol: '-',
    name: 'MINUS',
    color: 0x3b82f6,
    hex: '#3b82f6',
    badgeBg: '#1d4ed8'
  },
  '×': {
    symbol: '×',
    name: 'TIMES',
    color: 0xf97316,
    hex: '#f97316',
    badgeBg: '#c2410c'
  },
  '÷': {
    symbol: '÷',
    name: 'DIVIDE',
    color: 0xa855f7,
    hex: '#a855f7',
    badgeBg: '#7e22ce'
  }
};

/**
 * Formats an integer 0..999 into a 3-digit string ("000".."999")
 * and breaks it down into hundreds, tens, and ones digits.
 */
export function formatThreeDigits(value) {
  const clamped = Math.max(MIN_NUMBER, Math.min(MAX_NUMBER, Math.trunc(Number(value) || 0)));
  const formatted = String(clamped).padStart(3, '0');
  return {
    value: clamped,
    formatted,
    hundreds: Number(formatted[0]),
    tens: Number(formatted[1]),
    ones: Number(formatted[2])
  };
}

/**
 * Generates a random integer target between minTarget and maxTarget (clamped to 000..999),
 * ensuring it does not equal excludeValue.
 */
export function generateRandomTarget(minTarget = 5, maxTarget = 999, excludeValue = 0) {
  const lo = Math.max(MIN_NUMBER, Math.min(MAX_NUMBER, Math.trunc(minTarget)));
  const hi = Math.max(lo, Math.min(MAX_NUMBER, Math.trunc(maxTarget)));
  if (lo === hi) return lo;
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = lo + Math.floor(Math.random() * (hi - lo + 1));
    if (candidate !== excludeValue) {
      return candidate;
    }
  }
  return lo === excludeValue ? hi : lo;
}

/**
 * Parses an operation bubble specification like "+10", "-2", "×3", "÷5", or { op: '+', value: 10 }.
 */
export function parseBubbleSpec(spec, fallbackOp = '+') {
  if (typeof spec === 'number') {
    const val = Math.trunc(spec);
    if (val < 0) return { op: '-', value: Math.abs(val), label: `-${Math.abs(val)}` };
    return { op: fallbackOp, value: val, label: `${fallbackOp}${val}` };
  }
  if (typeof spec === 'string') {
    const trimmed = spec.trim().replace('*', '×').replace('/', '÷');
    const first = trimmed[0];
    if (OPERATORS[first]) {
      const val = Math.trunc(Number(trimmed.slice(1)));
      return { op: first, value: val, label: `${first}${val}` };
    }
    const val = Math.trunc(Number(trimmed));
    return { op: fallbackOp, value: val, label: `${fallbackOp}${val}` };
  }
  if (spec && typeof spec === 'object') {
    const op = OPERATORS[spec.op] ? spec.op : fallbackOp;
    const val = Math.trunc(Number(spec.value));
    return { op, value: val, label: `${op}${val}` };
  }
  return { op: fallbackOp, value: NaN, label: '?' };
}

/**
 * Core Math Counter for a player or co-op team.
 */
export class MathCounter {
  constructor({ startValue = 0, targetValue = 15, initialOperator = '+' } = {}) {
    this.startValue = Math.max(MIN_NUMBER, Math.min(MAX_NUMBER, Math.trunc(startValue)));
    this.targetValue = Math.max(MIN_NUMBER, Math.min(MAX_NUMBER, Math.trunc(targetValue)));
    this.initialOperator = OPERATORS[initialOperator] ? initialOperator : '+';
    this.currentValue = this.startValue;
    this.activeOperator = this.initialOperator;
    this.history = [];
    this.stepsCount = 0;
  }

  getFormattedCurrent() {
    return formatThreeDigits(this.currentValue);
  }

  getFormattedTarget() {
    return formatThreeDigits(this.targetValue);
  }

  isDoorUnlocked() {
    return this.currentValue === this.targetValue;
  }

  /**
   * Smart ceiling linked to the Door's targetValue so players can never accidentally
   * multiply 5x too high above a small door target!
   */
  getSmartMaxLimit() {
    if (this.targetValue >= 700) return MAX_NUMBER;
    return Math.min(
      MAX_NUMBER,
      Math.max(this.targetValue + 25, Math.ceil(this.targetValue * 1.45))
    );
  }

  /**
   * Returns a helpful reduction bubble ('÷d' or '-k') when currentValue > targetValue.
   */
  getSmartOvershootBubble(allowedPool = null) {
    const cur = this.currentValue;
    const target = this.targetValue;
    if (cur <= target) {
      return this.getSmartBubble(allowedPool);
    }

    const diff = cur - target;

    // 1. If we are significantly above target (diff >= 12), check if an exact divisor (2..10) brings us closer
    if (diff >= 12) {
      for (let d = 2; d <= 10; d++) {
        if (cur % d === 0) {
          const quot = cur / d;
          if (Math.abs(target - quot) < diff && quot >= Math.floor(target * 0.35)) {
            return { op: '÷', value: d, label: `÷${d}` };
          }
        }
      }
      // 2. If cur is prime / not divisible by a useful 2..10, find a small subtraction (-1..-5) that lands on a multiple!
      for (let k = 1; k <= 5; k++) {
        const nextVal = cur - k;
        for (let d = 2; d <= 10; d++) {
          if (nextVal > 0 && nextVal % d === 0 && Math.abs(target - nextVal / d) < diff) {
            return { op: '-', value: k, label: `-${k}` };
          }
        }
      }
    }

    // 3. Otherwise use a subtraction in 1..10 (splitting into 2 steps if diff <= 10 so the player still calculates!)
    if (diff <= 10 && diff >= 4) {
      const half = Math.ceil(diff / 2);
      return { op: '-', value: half, label: `-${half}` };
    }
    const subVal = Math.min(10, Math.max(1, diff));
    return { op: '-', value: subVal, label: `-${subVal}` };
  }

  setOperator(op) {
    if (!OPERATORS[op]) {
      return { changed: false, activeOperator: this.activeOperator };
    }
    const changed = this.activeOperator !== op;
    this.activeOperator = op;
    return {
      changed,
      activeOperator: this.activeOperator,
      operatorInfo: OPERATORS[this.activeOperator]
    };
  }

  /**
   * Checks whether a pickup value can cleanly divide the current number when in '÷' mode.
   */
  isDivisibleBy(pickupValue) {
    const val = Math.trunc(Number(pickupValue));
    if (val <= 0) return false;
    return this.currentValue % val === 0;
  }

  /**
   * Applies an operation bubble (e.g. "+10", "-2", "×3", "÷5", or { op: '+', value: 10 }).
   */
  applyBubble(bubbleSpec) {
    const parsed = parseBubbleSpec(bubbleSpec, this.activeOperator);
    if (!Number.isFinite(parsed.value) || parsed.value <= 0 || !OPERATORS[parsed.op]) {
      return {
        accepted: false,
        reason: 'invalid_pickup',
        previousValue: this.currentValue,
        value: this.currentValue,
        message: t('invalidPickupMsg')
      };
    }
    this.activeOperator = parsed.op;
    return this.applyPickup(parsed.value);
  }

  /**
   * Applies a number pickup using the currently active operator (+, -, ×, ÷).
   */
  applyPickup(pickupValue) {
    const n = Math.trunc(Number(pickupValue));
    if (!Number.isFinite(n) || n <= 0) {
      return {
        accepted: false,
        reason: 'invalid_pickup',
        previousValue: this.currentValue,
        value: this.currentValue,
        message: t('invalidPickupMsg')
      };
    }

    const prev = this.currentValue;
    const op = this.activeOperator;
    const maxLimit = this.getSmartMaxLimit();
    let candidate = prev;

    if (op === '+') {
      candidate = prev + n;
      if (candidate > maxLimit) {
        return {
          accepted: false,
          reason: 'too_high',
          previousValue: prev,
          value: prev,
          candidate,
          operator: op,
          operand: n,
          message: t('tooHighMsg', { candidate })
        };
      }
    } else if (op === '-') {
      candidate = Math.max(MIN_NUMBER, prev - n);
    } else if (op === '×') {
      candidate = prev * n;
      if (candidate > maxLimit) {
        return {
          accepted: false,
          reason: 'too_high',
          previousValue: prev,
          value: prev,
          candidate,
          operator: op,
          operand: n,
          message: t('tooHighMsg', { candidate })
        };
      }
    } else if (op === '÷') {
      if (prev % n !== 0) {
        return {
          accepted: false,
          reason: 'not_divisible',
          previousValue: prev,
          value: prev,
          operator: op,
          operand: n,
          message: t('notDivisibleMsg', { prev, n })
        };
      }
      candidate = prev / n;
    }

    const expr = `${formatThreeDigits(prev).formatted} ${op} ${n} = ${formatThreeDigits(candidate).formatted}`;
    this.history.push({
      previousValue: prev,
      newValue: candidate,
      operator: op,
      operand: n,
      expression: expr
    });
    this.currentValue = candidate;
    this.stepsCount += 1;

    return {
      accepted: true,
      previousValue: prev,
      value: this.currentValue,
      operator: op,
      operand: n,
      expression: expr,
      shortLabel: `${op}${n}`,
      unlockedDoor: this.isDoorUnlocked()
    };
  }

  /**
   * Applies a Mario-style special brick bumped from below.
   * Supported brick types:
   * - '+', '-', '×', '÷' : Switches active operator
   * - '×10' : Shifts digits left (multiplies by 10, if <= 999)
   * - '÷10' : Shifts digits right (integer division by 10)
   * - '+1', '-1', '+10', '-10' : Direct nudge
   * - 'undo' : Reverts the last math operation
   * - 'reset' : Resets back to startValue
   * - 'swap' : Used in 2P Versus mode to swap numbers/operators
   * - 'mystery' : Spawns a smart helper pickup
   */
  applyBrick(brickType) {
    if (OPERATORS[brickType]) {
      const res = this.setOperator(brickType);
      return {
        accepted: true,
        kind: 'operator',
        operator: this.activeOperator,
        changed: res.changed,
        value: this.currentValue,
        shortLabel: `Mode: ${brickType}`,
        unlockedDoor: this.isDoorUnlocked()
      };
    }

    const prev = this.currentValue;

    if (brickType === '×2' || brickType === '×3') {
      const factor = Number(brickType.slice(1));
      const candidate = prev * factor;
      if (candidate > MAX_NUMBER) {
        return {
          accepted: false,
          kind: 'modifier',
          reason: 'too_high',
          previousValue: prev,
          value: prev,
          shortLabel: t('tooHighMsg', { candidate }),
          unlockedDoor: this.isDoorUnlocked()
        };
      }
      this._recordStep(
        prev,
        candidate,
        '×',
        factor,
        `${formatThreeDigits(prev).formatted} × ${factor} = ${formatThreeDigits(candidate).formatted}`
      );
      return {
        accepted: true,
        kind: 'modifier',
        previousValue: prev,
        value: this.currentValue,
        shortLabel: `${brickType}!`,
        unlockedDoor: this.isDoorUnlocked()
      };
    }

    if (brickType === '×10') {
      const candidate = prev * 10;
      if (candidate > MAX_NUMBER) {
        return {
          accepted: false,
          kind: 'modifier',
          reason: 'too_high',
          previousValue: prev,
          value: prev,
          shortLabel: 'Too High! (>999)',
          unlockedDoor: this.isDoorUnlocked()
        };
      }
      this._recordStep(prev, candidate, '×', 10, `${formatThreeDigits(prev).formatted} × 10 = ${formatThreeDigits(candidate).formatted}`);
      return {
        accepted: true,
        kind: 'modifier',
        previousValue: prev,
        value: this.currentValue,
        shortLabel: '×10 Shift!',
        unlockedDoor: this.isDoorUnlocked()
      };
    }

    if (brickType === '÷10') {
      const candidate = Math.floor(prev / 10);
      this._recordStep(prev, candidate, '÷', 10, `${formatThreeDigits(prev).formatted} ÷ 10 = ${formatThreeDigits(candidate).formatted}`);
      return {
        accepted: true,
        kind: 'modifier',
        previousValue: prev,
        value: this.currentValue,
        shortLabel: '÷10 Shift!',
        unlockedDoor: this.isDoorUnlocked()
      };
    }

    if (brickType === '+1' || brickType === '-1' || brickType === '+10' || brickType === '-10') {
      const delta = Number(brickType);
      const candidate = prev + delta;
      if (candidate > MAX_NUMBER) {
        return {
          accepted: false,
          kind: 'nudge',
          reason: 'too_high',
          previousValue: prev,
          value: prev,
          shortLabel: 'Max 999!',
          unlockedDoor: this.isDoorUnlocked()
        };
      }
      const clamped = Math.max(MIN_NUMBER, candidate);
      const opSymbol = delta >= 0 ? '+' : '-';
      const absDelta = Math.abs(delta);
      this._recordStep(prev, clamped, opSymbol, absDelta, `${formatThreeDigits(prev).formatted} ${opSymbol} ${absDelta} = ${formatThreeDigits(clamped).formatted}`);
      return {
        accepted: true,
        kind: 'nudge',
        previousValue: prev,
        value: this.currentValue,
        shortLabel: brickType,
        unlockedDoor: this.isDoorUnlocked()
      };
    }

    if (brickType === 'undo') {
      if (this.history.length === 0) {
        return {
          accepted: false,
          kind: 'undo',
          reason: 'empty_history',
          previousValue: prev,
          value: prev,
          shortLabel: t('nothingToUndoLabel'),
          unlockedDoor: this.isDoorUnlocked()
        };
      }
      const last = this.history.pop();
      this.currentValue = last.previousValue;
      return {
        accepted: true,
        kind: 'undo',
        previousValue: prev,
        value: this.currentValue,
        shortLabel: t('undoLabel', { val: formatThreeDigits(this.currentValue).formatted }),
        unlockedDoor: this.isDoorUnlocked()
      };
    }

    if (brickType === 'reset') {
      if (this.currentValue === this.startValue && this.activeOperator === this.initialOperator) {
        return {
          accepted: false,
          kind: 'reset',
          reason: 'already_reset',
          previousValue: prev,
          value: prev,
          shortLabel: t('alreadyResetLabel'),
          unlockedDoor: this.isDoorUnlocked()
        };
      }
      const startFmt = formatThreeDigits(this.startValue).formatted;
      this.history.push({
        previousValue: prev,
        newValue: this.startValue,
        operator: 'RESET',
        operand: 0,
        expression: t('resetHistoryExpr', { val: startFmt })
      });
      this.currentValue = this.startValue;
      this.activeOperator = this.initialOperator;
      this.stepsCount += 1;
      return {
        accepted: true,
        kind: 'reset',
        previousValue: prev,
        value: this.currentValue,
        shortLabel: t('resetLabel', { val: startFmt }),
        unlockedDoor: this.isDoorUnlocked()
      };
    }

    return {
      accepted: false,
      kind: 'unknown',
      reason: 'unknown_brick',
      previousValue: prev,
      value: prev,
      shortLabel: '?',
      unlockedDoor: this.isDoorUnlocked()
    };
  }

  /**
   * Friendly Minus Slime bump (-1, clamped at 0).
   */
  applySlimePenalty(penalty = 1) {
    const prev = this.currentValue;
    const candidate = Math.max(MIN_NUMBER, prev - penalty);
    if (candidate !== prev) {
      this._recordStep(prev, candidate, '-', penalty, `Slime bump! ${formatThreeDigits(prev).formatted} - ${penalty} = ${formatThreeDigits(candidate).formatted}`);
    }
    return {
      previousValue: prev,
      value: this.currentValue,
      shortLabel: `-${penalty} Slime!`,
      unlockedDoor: this.isDoorUnlocked()
    };
  }

  /**
   * Computes a smart number pickup value for a '?' Mystery Brick based on distance to target.
   */
  getSmartHelperValue(allowedValues = [1, 2, 3, 5, 10]) {
    const diff = Math.abs(this.targetValue - this.currentValue);
    if (diff === 0) return allowedValues[0] || 1;

    // Exact match in allowed values
    if (allowedValues.includes(diff)) {
      return diff;
    }

    // If multiplication can reach or get close to target
    if (this.currentValue > 0 && this.targetValue > this.currentValue && this.targetValue % this.currentValue === 0) {
      const factor = this.targetValue / this.currentValue;
      if (allowedValues.includes(factor)) {
        return factor;
      }
    }

    // Pick largest allowed value that doesn't overshoot diff (or smallest if all overshoot)
    const sorted = [...allowedValues].sort((a, b) => b - a);
    for (const v of sorted) {
      if (v <= diff) return v;
    }
    return sorted[sorted.length - 1] || 1;
  }

  /**
   * Computes a shortest path of operation bubbles where EVERY operand is strictly between 1 and 10
   * (+1..+10, -1..-10, ×2..×10, ÷2..÷10) using Breadth-First Search over 0..999.
   */
  getWinningPathBubbles(fromValue = this.currentValue, toValue = this.targetValue, allowedPool = null) {
    const start = Math.max(MIN_NUMBER, Math.min(MAX_NUMBER, Math.trunc(fromValue)));
    const target = Math.max(MIN_NUMBER, Math.min(MAX_NUMBER, Math.trunc(toValue)));
    if (start === target) {
      return [{ op: '+', value: 1, label: '+1' }];
    }

    const ops = allowedPool
      ? allowedPool.map((spec) => parseBubbleSpec(spec)).filter((p) => p.value >= 1 && p.value <= 10)
      : ALL_BUBBLE_OPS_1_TO_10;

    const maxLimit = Math.max(target, this.getSmartMaxLimit());

    // BFS over 0..maxLimit
    const visited = new Uint8Array(MAX_NUMBER + 1);
    const parentVal = new Int16Array(MAX_NUMBER + 1).fill(-1);
    const parentOp = new Array(MAX_NUMBER + 1).fill(null);

    const queue = [start];
    visited[start] = 1;

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur === target) break;

      for (const opObj of ops) {
        const { op, value } = opObj;
        let next = -1;
        if (op === '+') {
          next = cur + value;
        } else if (op === '-') {
          next = cur - value;
        } else if (op === '×') {
          if (cur > 0) next = cur * value;
        } else if (op === '÷') {
          if (cur > 0 && cur % value === 0) next = cur / value;
        }

        if (next >= MIN_NUMBER && next <= maxLimit && !visited[next]) {
          visited[next] = 1;
          parentVal[next] = cur;
          parentOp[next] = opObj;
          queue.push(next);
        }
      }
    }

    if (!visited[target]) {
      // Fallback using ALL_BUBBLE_OPS_1_TO_10 if custom pool couldn't reach
      if (allowedPool) {
        return this.getWinningPathBubbles(start, target, null);
      }
      return [{ op: '+', value: 1, label: '+1' }];
    }

    const path = [];
    let curr = target;
    while (curr !== start && parentOp[curr]) {
      path.push(parentOp[curr]);
      curr = parentVal[curr];
    }
    path.reverse();
    return path;
  }

  /**
   * Computes a step-by-step solution hint from currentValue to targetValue.
   * First tries to find a 1-to-3 step solution using ONLY the bubbles currently on the platforms (`activeLabels`).
   * Otherwise computes the shortest path using `stagePool` (all operands 1..10).
   */
  getHintSolution(activeLabels = [], stagePool = null) {
    const start = this.currentValue;
    const target = this.targetValue;
    if (start === target) {
      const fmt = formatThreeDigits(target).formatted;
      return {
        steps: [],
        formula: `${fmt} = ${fmt}`
      };
    }

    // 1. Try a 1-to-3 step BFS using the exact bubbles currently on the map (without reusing the same single bubble instance unless present multiple times)
    if (Array.isArray(activeLabels) && activeLabels.length > 0) {
      const activeSpecs = activeLabels.map((l) => parseBubbleSpec(l));
      const queue = [{ val: start, usedIndices: [], steps: [] }];
      const seen = new Set([`${start}:`]);

      while (queue.length > 0) {
        const cur = queue.shift();
        if (cur.val === target && cur.steps.length > 0) {
          return {
            steps: cur.steps,
            formula: this._formatHintFormula(start, cur.steps, target)
          };
        }
        if (cur.steps.length >= 3) continue;

        for (let i = 0; i < activeSpecs.length; i++) {
          if (cur.usedIndices.includes(i)) continue;
          const sp = activeSpecs[i];
          const nextVal = this._simulateSingleStep(cur.val, sp.op, sp.value);
          if (nextVal !== null) {
            const key = `${nextVal}:${cur.steps.length + 1}`;
            if (!seen.has(key)) {
              seen.add(key);
              queue.push({
                val: nextVal,
                usedIndices: [...cur.usedIndices, i],
                steps: [...cur.steps, sp]
              });
            }
          }
        }
      }
    }

    // 2. Otherwise use BFS over stagePool (or all 1..10 ops), splitting a trivial 1-step into 2 steps if possible
    let steps = this.getWinningPathBubbles(start, target, stagePool);
    if (steps.length === 1 && (steps[0].op === '+' || steps[0].op === '-') && steps[0].value >= 4) {
      const v1 = Math.ceil(steps[0].value / 2);
      const v2 = steps[0].value - v1;
      const op = steps[0].op;
      steps = [
        { op, value: v1, label: `${op}${v1}` },
        { op, value: v2, label: `${op}${v2}` }
      ];
    }

    return {
      steps,
      formula: this._formatHintFormula(start, steps, target)
    };
  }

  _simulateSingleStep(cur, op, value) {
    const maxLimit = this.getSmartMaxLimit();
    if (op === '+') {
      const next = cur + value;
      return next <= maxLimit ? next : null;
    }
    if (op === '-') {
      return cur - value >= MIN_NUMBER ? cur - value : null;
    }
    if (op === '×') {
      if (cur <= 0) return null;
      const next = cur * value;
      return next <= maxLimit ? next : null;
    }
    if (op === '÷') {
      if (cur <= 0 || value <= 0 || cur % value !== 0) return null;
      return cur / value;
    }
    return null;
  }

  _formatHintFormula(startVal, steps, targetVal) {
    if (!steps || steps.length === 0) {
      return `${startVal} = ${targetVal}`;
    }
    const firstStep = startVal === 0 && steps[0].op === '+' ? 1 : 0;
    let expr = `${firstStep ? steps[0].value : startVal}`;
    let prevOp = null;

    for (let i = firstStep; i < steps.length; i++) {
      const s = steps[i];
      if (i > firstStep) {
        const isCurrentMultDiv = s.op === '×' || s.op === '÷';
        const wasPrevMultDiv = prevOp === '×' || prevOp === '÷';
        const isOpSwitch = prevOp !== null && prevOp !== s.op;
        if (isCurrentMultDiv || wasPrevMultDiv || isOpSwitch) {
          expr = `(${expr})`;
        }
      }
      expr = `${expr} ${s.op} ${s.value}`;
      prevOp = s.op;
    }
    return `${expr} = ${targetVal}`;
  }

  /**
   * Computes a smart operation bubble (with operand 1..10) that helps the player progress
   * without trivially finishing in 1 step when a 2-step mental calculation is possible!
   */
  getSmartBubble(allowedPool = null) {
    const path = this.getWinningPathBubbles(this.currentValue, this.targetValue, allowedPool);
    if (path.length === 1) {
      const single = path[0];
      if ((single.op === '+' || single.op === '-') && single.value >= 4) {
        const splitVal = Math.ceil(single.value / 2);
        return { op: single.op, value: splitVal, label: `${single.op}${splitVal}` };
      }
    }
    return path[0] || { op: '+', value: 1, label: '+1' };
  }

  _recordStep(prev, next, op, operand, expression) {
    this.history.push({
      previousValue: prev,
      newValue: next,
      operator: op,
      operand,
      expression
    });
    this.currentValue = next;
    this.stepsCount += 1;
  }
}
