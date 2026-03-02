/**
 * Computes the Levenshtein (edit) distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
    const aLen = a.length;
    const bLen = b.length;
    const dp: number[][] = Array.from({ length: aLen + 1 }, (_, i) =>
        Array.from({ length: bLen + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= aLen; i++) {
        for (let j = 1; j <= bLen; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[aLen][bLen];
}

/**
 * Returns the maximum number of edit-distance errors to tolerate for a given
 * correct answer length after basic normalization.
 *   length ≤ 3  → 0  (exact match required)
 *   length 4–7  → 1  (one typo allowed)
 *   length ≥ 8  → 2  (two typos allowed)
 */
function allowedEdits(correctAnswer: string): number {
    if (correctAnswer.length <= 3) return 0;
    if (correctAnswer.length <= 7) return 1;
    return 2;
}

/**
 * Normalizes an answer string by trimming whitespace and converting to lower case.
 */
function normalize(answer: string): string {
    return answer.trim().toLowerCase();
}

/**
 * Checks whether a user's answer matches the correct answer for a short-answer
 * question, applying the following normalization:
 *  - Leading/trailing whitespace is ignored
 *  - Comparison is case-insensitive
 *  - Minor spelling mistakes are tolerated based on the length of the correct answer
 */
export function isShortAnswerCorrect(correctAnswer: string, userAnswer: string): boolean {
    const normalized = normalize(correctAnswer);
    const guess = normalize(userAnswer);
    if (normalized === guess) return true;
    return levenshteinDistance(normalized, guess) <= allowedEdits(normalized);
}
