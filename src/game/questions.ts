import { getLevel } from "./levels";

export interface Question {
  id: string;
  a: number;
  b: number;
  answer: number;
  options: number[];
  correctIndex: number;
}

export const QUESTIONS_PER_LEVEL = 10;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds two plausible, unique distractors for a multiplication fact.
 * It mixes off-by-one tables, neighbouring products, and nearby values.
 * This keeps every question at exactly one correct answer.
 */
export function buildDistractors(a: number, b: number, answer: number): [number, number] {
  const possibilities = [
    a * (b + 1),
    a * (b - 1),
    (a + 1) * b,
    (a - 1) * b,
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
    answer + 3,
    answer + 4,
    answer + a,
    answer - b,
  ];

  const unique = [...new Set(possibilities.filter((value) => Number.isInteger(value) && value > 0 && value !== answer))];
  const shuffled = shuffle(unique);
  const picked = shuffled.slice(0, 2);

  // Safety net for tiny products, so we always return exactly two distractors.
  let fallback = answer + 1;
  while (picked.length < 2) {
    if (fallback > 0 && fallback !== answer && !picked.includes(fallback)) {
      picked.push(fallback);
    }
    fallback += 1;
  }

  return [picked[0], picked[1]];
}

/** Builds exactly 10 questions, each with exactly 3 unique options and one correct answer. */
export function buildQuestions(levelId: number): Question[] {
  const level = getLevel(levelId);
  const facts: { a: number; b: number; answer: number }[] = [];

  level.tables.forEach((a) => {
    for (let b = 1; b <= 10; b += 1) {
      facts.push({ a, b, answer: a * b });
    }
  });

  // Spread the questions across tables so one table does not dominate the level.
  const grouped = shuffle(level.tables).map((table) =>
    shuffle(
      Array.from({ length: 10 }, (_, index) => ({
        a: table,
        b: index + 1,
        answer: table * (index + 1),
      })),
    ),
  );

  const selected: typeof facts = [];
  const used = new Set<string>();
  let cursor = 0;

  while (selected.length < QUESTIONS_PER_LEVEL && grouped.some((group) => group.length > 0)) {
    const group = grouped[cursor % grouped.length];
    const fact = group.shift();
    if (fact) {
      const key = `${fact.a}x${fact.b}`;
      if (!used.has(key)) {
        used.add(key);
        selected.push(fact);
      }
    }
    cursor += 1;
  }

  // If a level ever has fewer than ten available facts, fill from the full level bank.
  for (const fact of shuffle(facts)) {
    if (selected.length >= QUESTIONS_PER_LEVEL) break;
    const key = `${fact.a}x${fact.b}`;
    if (!used.has(key)) {
      used.add(key);
      selected.push(fact);
    }
  }

  return shuffle(selected)
    .slice(0, QUESTIONS_PER_LEVEL)
    .map((fact, index) => {
      const distractors = buildDistractors(fact.a, fact.b, fact.answer);
      const options = shuffle([fact.answer, ...distractors]);
      return {
        id: `L${levelId}-Q${index + 1}-${fact.a}-${fact.b}`,
        a: fact.a,
        b: fact.b,
        answer: fact.answer,
        options,
        correctIndex: options.indexOf(fact.answer),
      };
    });
}

export function validateQuestions(levelId: number, questions: Question[]): boolean {
  if (questions.length !== QUESTIONS_PER_LEVEL) return false;
  const level = getLevel(levelId);
  const seen = new Set<string>();
  return questions.every((question) => {
    const key = `${question.a}x${question.b}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return (
      level.tables.includes(question.a) &&
      question.a * question.b === question.answer &&
      question.options.length === 3 &&
      new Set(question.options).size === 3 &&
      question.options.filter((option) => option === question.answer).length === 1 &&
      question.options[question.correctIndex] === question.answer
    );
  });
}

export function explanationFor(question: Question): string {
  const terms = Array.from({ length: question.b }, () => String(question.a)).join(" + ");
  return `${question.a} × ${question.b} = ${question.answer}. Artinya, ${terms} = ${question.answer}.`;
}
