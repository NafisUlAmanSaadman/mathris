import type { Difficulty } from '../constants/config';

// ─── Types ───────────────────────────────────────────────────────────────────

export type EquationTopic =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'mixed'
  | 'algebra-one-step'
  | 'algebra-two-step'
  | 'algebra-rational'
  | 'systems-integer'
  | 'systems-decimal';

export interface Equation {
  display: string;       // e.g. "6 × 7 = ?"  or  "2X − 3 = 7"
  answer: string;        // e.g. "42"  or  "X=5"  or  "X=2,Y=1"
  topic: EquationTopic;
  difficulty: Difficulty;
  hints: string[];       // step-by-step hint strings
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Easy — Arithmetic ───────────────────────────────────────────────────────

function makeAddition(): Equation {
  const a = rand(10, 99), b = rand(10, 99);
  return {
    display: `${a} + ${b} = ?`,
    answer: String(a + b),
    topic: 'addition',
    difficulty: 'easy',
    hints: [
      `Start with ${a}`,
      `Add ${b} ones: ${a} + ${b}`,
      `Answer: ${a + b}`,
    ],
  };
}

function makeSubtraction(): Equation {
  const b = rand(10, 99), diff = rand(1, 99);
  const a = b + diff;
  return {
    display: `${a} − ${b} = ?`,
    answer: String(diff),
    topic: 'subtraction',
    difficulty: 'easy',
    hints: [
      `Start with ${a}`,
      `Subtract ${b}`,
      `${a} − ${b} = ${diff}`,
    ],
  };
}

function makeMultiplication(): Equation {
  const a = rand(2, 12), b = rand(2, 12);
  const ans = a * b;
  const steps: string[] = [`${a} × ${b}`];
  const additions = Array.from({ length: a }, (_, i) => `${b} × ${i + 1} = ${b * (i + 1)}`);
  return {
    display: `${a} × ${b} = ?`,
    answer: String(ans),
    topic: 'multiplication',
    difficulty: 'easy',
    hints: [
      `Think of ${a} groups of ${b}`,
      additions.slice(0, 3).join('  →  ') + '  →  ...',
      `${a} × ${b} = ${ans}`,
    ],
  };
}

function makeDivision(): Equation {
  const b = rand(2, 12), ans = rand(2, 12);
  const a = b * ans;
  return {
    display: `${a} ÷ ${b} = ?`,
    answer: String(ans),
    topic: 'division',
    difficulty: 'easy',
    hints: [
      `How many times does ${b} go into ${a}?`,
      `${b} × ${ans} = ${a}`,
      `So ${a} ÷ ${b} = ${ans}`,
    ],
  };
}

// ─── Medium — Algebra ─────────────────────────────────────────────────────────

function makeOneStepAlgebra(): Equation {
  const topics: Array<() => Equation> = [
    () => {
      // X + b = c
      const b = rand(2, 20), ans = rand(2, 20), c = ans + b;
      return {
        display: `X + ${b} = ${c}`,
        answer: `X=${ans}`,
        topic: 'algebra-one-step',
        difficulty: 'medium',
        hints: [
          `X + ${b} = ${c}`,
          `Subtract ${b} from both sides`,
          `X = ${c} − ${b} = ${ans}`,
        ],
      };
    },
    () => {
      // X - b = c
      const b = rand(2, 20), ans = rand(2, 20), c = ans - b;
      if (c < 0) return makeOneStepAlgebra(); // retry if negative
      return {
        display: `X − ${b} = ${c}`,
        answer: `X=${ans}`,
        topic: 'algebra-one-step',
        difficulty: 'medium',
        hints: [
          `X − ${b} = ${c}`,
          `Add ${b} to both sides`,
          `X = ${c} + ${b} = ${ans}`,
        ],
      };
    },
    () => {
      // a * X = c
      const a = rand(2, 10), ans = rand(2, 12), c = a * ans;
      return {
        display: `${a}X = ${c}`,
        answer: `X=${ans}`,
        topic: 'algebra-one-step',
        difficulty: 'medium',
        hints: [
          `${a}X = ${c}`,
          `Divide both sides by ${a}`,
          `X = ${c} ÷ ${a} = ${ans}`,
        ],
      };
    },
  ];
  return shuffle(topics)[0]();
}

function makeTwoStepAlgebra(): Equation {
  // aX + b = c
  const a = rand(2, 8), b = rand(1, 15), ans = rand(1, 10);
  const c = a * ans + b;
  return {
    display: `${a}X + ${b} = ${c}`,
    answer: `X=${ans}`,
    topic: 'algebra-two-step',
    difficulty: 'medium',
    hints: [
      `${a}X + ${b} = ${c}`,
      `Step 1: Subtract ${b} → ${a}X = ${c - b}`,
      `Step 2: Divide by ${a} → X = ${ans}`,
    ],
  };
}

function makeRationalAlgebra(): Equation {
  // a / X = b  ⇒  X = a / b
  const b = rand(2, 10), ans = rand(2, 10), a = b * ans;
  return {
    display: `${a} ÷ X = ${b}`,
    answer: `X=${ans}`,
    topic: 'algebra-rational',
    difficulty: 'medium',
    hints: [
      `${a} ÷ X = ${b}`,
      `Multiply both sides by X: ${a} = ${b}X`,
      `Divide both sides by ${b}: X = ${ans}`,
    ],
  };
}

// ─── Hard — Systems of Equations ─────────────────────────────────────────────

function makeIntegerSystem(): Equation {
  // System: aX + bY = c  and  dX + eY = f
  // Pick solution first, then build equations
  const X = rand(1, 6), Y = rand(1, 6);
  const a = rand(1, 5), b = rand(1, 5);
  const d = rand(1, 5), e = rand(1, 5);
  const c = a * X + b * Y;
  const f = d * X + e * Y;
  return {
    display: `${a}X + ${b}Y = ${c}\n${d}X + ${e}Y = ${f}`,
    answer: `X=${X},Y=${Y}`,
    topic: 'systems-integer',
    difficulty: 'hard',
    hints: [
      `Equation 1: ${a}X + ${b}Y = ${c}`,
      `Equation 2: ${d}X + ${e}Y = ${f}`,
      `From Eq.1: X = (${c} − ${b}Y) ÷ ${a}`,
      `Substitute into Eq.2 and solve for Y`,
      `Y = ${Y}, then X = ${X}`,
    ],
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function generateEquation(
  difficulty: Difficulty,
  topic?: EquationTopic,
): Equation {
  if (difficulty === 'easy') {
    const generators = [makeAddition, makeSubtraction, makeMultiplication, makeDivision];
    if (topic === 'addition') return makeAddition();
    if (topic === 'subtraction') return makeSubtraction();
    if (topic === 'multiplication') return makeMultiplication();
    if (topic === 'division') return makeDivision();
    return shuffle(generators)[0]();
  }

  if (difficulty === 'medium') {
    const generators = [makeOneStepAlgebra, makeTwoStepAlgebra, makeRationalAlgebra];
    if (topic === 'algebra-one-step') return makeOneStepAlgebra();
    if (topic === 'algebra-two-step') return makeTwoStepAlgebra();
    if (topic === 'algebra-rational') return makeRationalAlgebra();
    return shuffle(generators)[0]();
  }

  // hard
  return makeIntegerSystem();
}

/**
 * Validate a user's input string against the equation's expected answer.
 * Handles "42", "X=5", "X=2,Y=1" (order-insensitive).
 */
export function validateAnswer(equation: Equation, input: string): boolean {
  const clean = input.trim().replace(/\s/g, '').toUpperCase();
  const expected = equation.answer.trim().replace(/\s/g, '').toUpperCase();

  // Simple numeric answer
  if (!expected.includes('=')) {
    return clean === expected;
  }

  // Variable answers — parse into key=value map
  const parseMap = (s: string): Record<string, string> => {
    const map: Record<string, string> = {};
    s.split(',').forEach(part => {
      const [k, v] = part.split('=');
      if (k && v !== undefined) map[k.trim()] = v.trim();
    });
    return map;
  };

  const expectedMap = parseMap(expected);
  const inputMap = parseMap(clean);

  return Object.keys(expectedMap).every(k => expectedMap[k] === inputMap[k]);
}
