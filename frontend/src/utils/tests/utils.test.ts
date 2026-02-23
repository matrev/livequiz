import { validateQuizInput } from '../utils';
import { QuestionType } from '@/generated/types';

describe('validateQuizInput', () => {
  it('does not throw for valid quiz input', () => {
    expect(() =>
      validateQuizInput({
        title: 'History Quiz',
        userId: 1,
        name: 'Host',
        email: 'host@example.com',
        questions: [
          {
            text: '2 + 2 = ?',
            questionType: QuestionType.MultipleChoice,
            options: ['3', '4'],
            correctAnswer: '4',
          },
        ],
      }),
    ).not.toThrow();
  });

  it('throws when title is missing', () => {
    expect(() =>
      validateQuizInput({
        title: '',
        userId: 1,
        name: 'Host',
        email: 'host@example.com',
        questions: [
          {
            text: 'Question',
            questionType: QuestionType.ShortAnswer,
            options: null,
          },
        ],
      }),
    ).toThrow('A Title for a quiz is required.');
  });
});
