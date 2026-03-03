import { isShortAnswerCorrect } from './normalizeAnswer.js';

describe('isShortAnswerCorrect', () => {
    describe('exact matches', () => {
        it('returns true for identical answers', () => {
            expect(isShortAnswerCorrect('Paris', 'Paris')).toBe(true);
        });
    });

    describe('whitespace trimming', () => {
        it('ignores leading whitespace in the user answer', () => {
            expect(isShortAnswerCorrect('Paris', '  Paris')).toBe(true);
        });

        it('ignores trailing whitespace in the user answer', () => {
            expect(isShortAnswerCorrect('Paris', 'Paris  ')).toBe(true);
        });

        it('ignores surrounding whitespace in both answers', () => {
            expect(isShortAnswerCorrect('  Paris  ', '  Paris  ')).toBe(true);
        });
    });

    describe('case insensitivity', () => {
        it('matches regardless of capitalization', () => {
            expect(isShortAnswerCorrect('Paris', 'paris')).toBe(true);
        });

        it('matches all-caps user answer', () => {
            expect(isShortAnswerCorrect('Paris', 'PARIS')).toBe(true);
        });

        it('matches mixed-case user answer', () => {
            expect(isShortAnswerCorrect('The Eiffel Tower', 'the eiffel tower')).toBe(true);
        });
    });

    describe('spelling mistake tolerance', () => {
        it('rejects a single-character typo when correct answer is 3 chars or fewer', () => {
            expect(isShortAnswerCorrect('cat', 'bat')).toBe(false);
        });

        it('accepts a single-character typo for 4–7 character answers', () => {
            expect(isShortAnswerCorrect('Paris', 'Pares')).toBe(true);
        });

        it('rejects two typos for 4–7 character answers', () => {
            expect(isShortAnswerCorrect('Paris', 'Bares')).toBe(false);
        });

        it('accepts up to two typos for answers with 8 or more characters', () => {
            expect(isShortAnswerCorrect('elephant', 'eliphant')).toBe(true);
        });

        it('rejects three typos even for long answers', () => {
            expect(isShortAnswerCorrect('elephant', 'xlyphbnt')).toBe(false);
        });
    });

    describe('combined normalization', () => {
        it('handles whitespace and case together', () => {
            expect(isShortAnswerCorrect('Paris', '  paris  ')).toBe(true);
        });

        it('handles whitespace and a spelling mistake together', () => {
            expect(isShortAnswerCorrect('Paris', '  Pares  ')).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('returns false for completely different answers', () => {
            expect(isShortAnswerCorrect('Paris', 'London')).toBe(false);
        });

        it('returns false for an empty user answer when correct answer is non-empty', () => {
            expect(isShortAnswerCorrect('Paris', '')).toBe(false);
        });

        it('returns true when both answers are empty strings', () => {
            expect(isShortAnswerCorrect('', '')).toBe(true);
        });
    });
});
