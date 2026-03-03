import { computeLeaderboard } from '../Leaderboard.js';
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
