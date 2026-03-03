import { computeLeaderboard } from '../Leaderboard.js';

const makeEntry = (id: number, name: string, answers: Record<string, string>) => ({
  id,
  name,
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  answers,
  user: null,
});

describe('computeLeaderboard - standard question types', () => {
  it('awards a point for an exact correct answer', () => {
    const questions = [{ id: 1, correctAnswer: 'Paris', questionType: 'SHORT_ANSWER' }];
    const entries = [makeEntry(1, 'Alice', { '1': 'Paris' })];
    const rows = computeLeaderboard(questions, entries);
    expect(rows[0].correctCount).toBe(1);
  });

  it('is case-insensitive for non-numerical answers', () => {
    const questions = [{ id: 1, correctAnswer: 'Paris', questionType: 'SHORT_ANSWER' }];
    const entries = [makeEntry(1, 'Alice', { '1': 'paris' })];
    const rows = computeLeaderboard(questions, entries);
    expect(rows[0].correctCount).toBe(1);
  });
});

describe('computeLeaderboard - NUMERICAL (Price is Right rules)', () => {
  it('awards a point to the answer closest to correct without going over', () => {
    const questions = [{ id: 1, correctAnswer: '500', questionType: 'NUMERICAL' }];
    const entries = [
      makeEntry(1, 'Alice', { '1': '499' }),
      makeEntry(2, 'Bob', { '1': '300' }),
      makeEntry(3, 'Carol', { '1': '600' }),
    ];
    const rows = computeLeaderboard(questions, entries);
    const alice = rows.find((r) => r.name === 'Alice')!;
    const bob = rows.find((r) => r.name === 'Bob')!;
    const carol = rows.find((r) => r.name === 'Carol')!;
    expect(alice.correctCount).toBe(1);
    expect(bob.correctCount).toBe(0);
    expect(carol.correctCount).toBe(0);
  });

  it('awards a point to an exact match', () => {
    const questions = [{ id: 1, correctAnswer: '500', questionType: 'NUMERICAL' }];
    const entries = [makeEntry(1, 'Alice', { '1': '500' })];
    const rows = computeLeaderboard(questions, entries);
    expect(rows[0].correctCount).toBe(1);
  });

  it('awards points to tied answers (equal distance under correct)', () => {
    const questions = [{ id: 1, correctAnswer: '500', questionType: 'NUMERICAL' }];
    const entries = [
      makeEntry(1, 'Alice', { '1': '490' }),
      makeEntry(2, 'Bob', { '1': '490' }),
    ];
    const rows = computeLeaderboard(questions, entries);
    expect(rows[0].correctCount).toBe(1);
    expect(rows[1].correctCount).toBe(1);
  });

  it('awards no points when all answers go over', () => {
    const questions = [{ id: 1, correctAnswer: '500', questionType: 'NUMERICAL' }];
    const entries = [
      makeEntry(1, 'Alice', { '1': '501' }),
      makeEntry(2, 'Bob', { '1': '600' }),
    ];
    const rows = computeLeaderboard(questions, entries);
    expect(rows[0].correctCount).toBe(0);
    expect(rows[1].correctCount).toBe(0);
  });

  it('awards no points for non-numeric answers', () => {
    const questions = [{ id: 1, correctAnswer: '500', questionType: 'NUMERICAL' }];
    const entries = [makeEntry(1, 'Alice', { '1': 'five hundred' })];
    const rows = computeLeaderboard(questions, entries);
    expect(rows[0].correctCount).toBe(0);
  });

  it('ranks the winner first', () => {
    const questions = [{ id: 1, correctAnswer: '500', questionType: 'NUMERICAL' }];
    const entries = [
      makeEntry(1, 'Bob', { '1': '300' }),
      makeEntry(2, 'Alice', { '1': '499' }),
    ];
    const rows = computeLeaderboard(questions, entries);
    expect(rows[0].name).toBe('Alice');
    expect(rows[0].rank).toBe(1);
import { QuestionType } from '../../../../generated/prisma/enums.js';

const baseEntry = {
  id: 1,
  name: 'Alice',
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  user: null,
};

describe('computeLeaderboard – SHORT_ANSWER questions use isShortAnswerCorrect', () => {
  it('accepts an answer that differs only in case and whitespace', () => {
    const questions = [
      { id: 1, questionType: QuestionType.SHORT_ANSWER, correctAnswer: 'Paris' },
    ];
    const entries = [{ ...baseEntry, answers: { '1': '  paris  ' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(1);
  });

  it('accepts a minor spelling mistake within the Levenshtein threshold', () => {
    const questions = [
      { id: 1, questionType: QuestionType.SHORT_ANSWER, correctAnswer: 'Paris' },
    ];
    const entries = [{ ...baseEntry, answers: { '1': 'Pares' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(1);
  });

  it('rejects an answer that exceeds the Levenshtein threshold', () => {
    const questions = [
      { id: 1, questionType: QuestionType.SHORT_ANSWER, correctAnswer: 'Paris' },
    ];
    const entries = [{ ...baseEntry, answers: { '1': 'Bares' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(0);
  });

  it('marks a question with null correctAnswer as incorrect', () => {
    const questions = [
      { id: 1, questionType: QuestionType.SHORT_ANSWER, correctAnswer: null },
    ];
    const entries = [{ ...baseEntry, answers: { '1': 'Paris' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(0);
  });
});

describe('computeLeaderboard – MULTIPLE_CHOICE questions use exact match', () => {
  it('accepts an exact answer', () => {
    const questions = [
      { id: 1, questionType: QuestionType.MULTIPLE_CHOICE, correctAnswer: 'Option A' },
    ];
    const entries = [{ ...baseEntry, answers: { '1': 'Option A' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(1);
  });

  it('rejects an answer that differs only in case', () => {
    const questions = [
      { id: 1, questionType: QuestionType.MULTIPLE_CHOICE, correctAnswer: 'Option A' },
    ];
    const entries = [{ ...baseEntry, answers: { '1': 'option a' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(0);
  });

  it('rejects an answer with surrounding whitespace', () => {
    const questions = [
      { id: 1, questionType: QuestionType.MULTIPLE_CHOICE, correctAnswer: 'Option A' },
    ];
    const entries = [{ ...baseEntry, answers: { '1': '  Option A  ' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(0);
  });
});

describe('computeLeaderboard – TRUE_FALSE questions use exact match', () => {
  it('accepts an exact answer', () => {
    const questions = [
      { id: 1, questionType: QuestionType.TRUE_FALSE, correctAnswer: 'true' },
    ];
    const entries = [{ ...baseEntry, answers: { '1': 'true' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(1);
  });

  it('rejects an answer that differs in case', () => {
    const questions = [
      { id: 1, questionType: QuestionType.TRUE_FALSE, correctAnswer: 'true' },
    ];
    const entries = [{ ...baseEntry, answers: { '1': 'True' } }];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(0);
  });
});

describe('computeLeaderboard – mixed question types', () => {
  it('correctly scores a mix of SHORT_ANSWER and MULTIPLE_CHOICE questions', () => {
    const questions = [
      { id: 1, questionType: QuestionType.SHORT_ANSWER, correctAnswer: 'Paris' },
      { id: 2, questionType: QuestionType.MULTIPLE_CHOICE, correctAnswer: 'Option A' },
    ];
    const entries = [
      { ...baseEntry, answers: { '1': 'pares', '2': 'Option A' } },
    ];

    const rows = computeLeaderboard(questions, entries);

    expect(rows[0].correctCount).toBe(2);
  });
});
