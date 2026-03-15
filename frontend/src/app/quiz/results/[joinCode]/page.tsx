"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { getEntriesForQuiz, getQuiz } from "@/graphql/queries";
import { type GetEntriesForQuizQuery, QuestionType } from "@/generated/types";
import { quizTheme } from "../../theme";

type EntryAnswers = Record<string, string>;

type GroupedAnswerRow = {
  key: string;
  answer: string;
  voters: string[];
  isCorrect: boolean;
};

const getAnswerValue = (
  answers: unknown,
  questionId?: number | null,
): string => {
  if (!questionId || typeof answers !== "object" || answers === null) {
    return "";
  }

  const answerMap = answers as EntryAnswers;
  return answerMap[String(questionId)] ?? "";
};

const normalizeAnswerForGrouping = (
  answer: string,
  questionType: QuestionType,
): { key: string; display: string } | null => {
  const trimmed = answer.trim();
  if (!trimmed) return null;

  if (questionType === QuestionType.Numerical) {
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      const normalized = String(numeric);
      return {
        key: `num:${normalized}`,
        display: normalized,
      };
    }
  }

  if (questionType === QuestionType.TrueFalse) {
    const normalized = trimmed.toLowerCase();
    if (normalized === "true" || normalized === "false") {
      return {
        key: `bool:${normalized}`,
        display: normalized === "true" ? "True" : "False",
      };
    }
  }

  return {
    key: `text:${trimmed.toLowerCase()}`,
    display: trimmed,
  };
};

const isAnswerCorrect = (
  userAnswer: string,
  correctAnswer: string | null | undefined,
  questionType: QuestionType,
): boolean => {
  const isCorrectAnswerMissing =
    correctAnswer == null || correctAnswer.trim() === "";
  const isUserAnswerMissing = userAnswer.trim() === "";

  if (isCorrectAnswerMissing || isUserAnswerMissing) return false;

  if (questionType === QuestionType.Numerical) {
    const submitted = parseFloat(userAnswer);
    const correct = parseFloat(correctAnswer);
    if (isNaN(submitted) || isNaN(correct)) return false;
    return submitted <= correct;
  }

  return userAnswer.trim().toLowerCase() === correctAnswer!.trim().toLowerCase();
};

const findNumericalWinners = (
  grouped: Map<string, { answer: string; voters: string[] }>,
  correctAnswer: string | null | undefined,
): Set<string> => {
  const winners = new Set<string>();
  const correct = parseFloat(correctAnswer ?? "");
  if (isNaN(correct)) return winners;

  let bestDiff = Infinity;

  for (const [, value] of grouped) {
    if (value.voters.length === 0) continue;
    const submitted = parseFloat(value.answer);
    if (!isNaN(submitted) && submitted <= correct) {
      const diff = correct - submitted;
      if (diff < bestDiff) bestDiff = diff;
    }
  }

  if (!isFinite(bestDiff)) return winners;

  for (const [key, value] of grouped) {
    const submitted = parseFloat(value.answer);
    if (
      !isNaN(submitted) &&
      submitted <= correct &&
      correct - submitted === bestDiff
    ) {
      winners.add(key);
    }
  }

  return winners;
};

const formatQuestionType = (questionType: QuestionType): string => {
  switch (questionType) {
    case QuestionType.MultipleChoice:
      return "Multiple Choice";
    case QuestionType.TrueFalse:
      return "True/False";
    case QuestionType.Numerical:
      return "Numerical";
    default:
      return "Short Answer";
  }
};

const getGroupedAnswersForQuestion = ({
  entries,
  questionId,
  questionType,
  options,
  correctAnswer,
}: {
  entries: GetEntriesForQuizQuery["getEntriesForQuiz"];
  questionId: number | null | undefined;
  questionType: QuestionType;
  options?: Array<string | null> | null;
  correctAnswer?: string | null;
}): GroupedAnswerRow[] => {
  const grouped = new Map<string, { answer: string; voters: string[] }>();

  const addAnswer = (answerValue: string, voterName?: string) => {
    const normalized = normalizeAnswerForGrouping(answerValue, questionType);
    if (!normalized) return;

    const existing = grouped.get(normalized.key);
    if (existing) {
      if (voterName) {
        existing.voters.push(voterName);
      }
      return;
    }

    grouped.set(normalized.key, {
      answer: normalized.display,
      voters: voterName ? [voterName] : [],
    });
  };

  if (questionType === QuestionType.MultipleChoice) {
    (options ?? []).forEach((option) => {
      if (typeof option === "string" && option.trim()) {
        addAnswer(option);
      }
    });
  }

  if (questionType === QuestionType.TrueFalse) {
    addAnswer("True");
    addAnswer("False");
  }

  entries.forEach((entry) => {
    const submittedAnswer = getAnswerValue(entry.answers, questionId);
    if (!submittedAnswer) return;
    addAnswer(submittedAnswer, entry.name);
  });

  if (correctAnswer) {
    addAnswer(correctAnswer);
  }

  const numericalWinners =
    questionType === QuestionType.Numerical
      ? findNumericalWinners(grouped, correctAnswer)
      : null;

  return Array.from(grouped.entries())
    .map(([key, value]) => ({
      key,
      answer: value.answer,
      voters: value.voters,
      isCorrect: numericalWinners
        ? numericalWinners.has(key)
        : isAnswerCorrect(value.answer, correctAnswer, questionType),
    }))
    .sort((a, b) => {
      if (a.isCorrect !== b.isCorrect) {
        return a.isCorrect ? -1 : 1;
      }

      if (a.voters.length !== b.voters.length) {
        return b.voters.length - a.voters.length;
      }

      return a.answer.localeCompare(b.answer);
    });
};

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();

  const joinCode = String(params.joinCode ?? "").trim();
  const hasValidJoinCode = joinCode.length > 0;
  const {
    loading: quizLoading,
    error: quizError,
    data: quizData,
  } = useQuery(getQuiz, {
    variables: { joinCode },
    skip: !hasValidJoinCode,
  });

  const quizId = quizData?.getQuiz?.id ?? 0;
  const hasValidQuizId = Number.isInteger(quizId) && quizId > 0;

  const {
    loading: entriesLoading,
    error: entriesError,
    data: entriesData,
  } = useQuery(getEntriesForQuiz, {
    variables: { quizId },
    skip: !hasValidQuizId,
  });

  const questions = useMemo(
    () =>
      (quizData?.getQuiz?.questions ?? []).filter(
        (question) => question.id != null,
      ),
    [quizData],
  );

  const entries = useMemo(
    () => entriesData?.getEntriesForQuiz ?? [],
    [entriesData],
  );

  if (!hasValidJoinCode) {
    return (
      <div className={`${quizTheme.shell} ${quizTheme.page}`}>
        Invalid join code.
      </div>
    );
  }

  if (quizLoading) {
    return (
      <div className={`${quizTheme.shell} ${quizTheme.page}`}>
        Loading quiz...
      </div>
    );
  }

  if (quizError) {
    return (
      <div className={`${quizTheme.shell} ${quizTheme.page}`}>
        Error loading quiz: {quizError.message}
      </div>
    );
  }

  if (!quizData?.getQuiz) {
    return (
      <div className={`${quizTheme.shell} ${quizTheme.page}`}>
        Quiz not found.
      </div>
    );
  }

  if (entriesLoading) {
    return (
      <div className={`${quizTheme.shell} ${quizTheme.page}`}>
        Loading results...
      </div>
    );
  }

  if (entriesError) {
    return (
      <div className={`${quizTheme.shell} ${quizTheme.page}`}>
        Error loading results: {entriesError.message}
      </div>
    );
  }

  return (
    <div className={quizTheme.shell}>
      <div className={quizTheme.page}>
        <div className={quizTheme.header}>
          <h1 className={quizTheme.title}>
            {quizData.getQuiz.title} · Results
          </h1>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <button
              onClick={() => router.push(`/quiz/leaderboard/${joinCode}`)}
              className={`${quizTheme.buttonPrimary} w-full sm:w-auto`}
            >
              View leaderboard
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <p className={quizTheme.mutedText}>
            This quiz has no questions yet.
          </p>
        ) : (
          <div className="grid gap-6">
            {questions.map((question, questionIndex) => (
              <section key={question.id} className={quizTheme.itemCard}>
                {(() => {
                  const groupedAnswers = getGroupedAnswersForQuestion({
                    entries,
                    questionId: question.id,
                    questionType: question.questionType,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                  });

                  const hasAnyVotes = groupedAnswers.some(
                    (answer) => answer.voters.length > 0,
                  );

                  return (
                    <>
                      <div className="mb-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h2 className="m-0 text-base font-semibold text-white sm:text-lg">
                            {question.text}
                          </h2>
                          <span className="shrink-0 text-xs text-white/55">
                            {formatQuestionType(question.questionType)}
                          </span>
                        </div>
                      </div>

                      {!hasAnyVotes ? (
                        <p className="text-sm text-white/55">
                          No responses yet.
                        </p>
                      ) : (
                        <>
                          {/* Mobile: stacked cards */}
                          <div className="flex flex-col gap-2.5 sm:hidden">
                            {groupedAnswers.map((groupedAnswer) => (
                              <div
                                key={groupedAnswer.key}
                                className={`rounded-lg border px-3 py-2.5 ${
                                  groupedAnswer.isCorrect
                                    ? "border-emerald-500/30 bg-emerald-500/10"
                                    : "border-landing-border bg-landing-surface"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white">
                                    {groupedAnswer.answer}
                                  </span>
                                  {groupedAnswer.isCorrect ? (
                                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                      ✓ Correct
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-xs text-white/55">
                                  {groupedAnswer.voters.length === 0
                                    ? "No votes"
                                    : groupedAnswer.voters.join(", ")}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Desktop: table */}
                          <div className={`hidden sm:block ${quizTheme.tableWrap}`}>
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  <th className={quizTheme.tableHeader}>Answer</th>
                                  <th className={quizTheme.tableHeader}>
                                    Participants
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupedAnswers.map((groupedAnswer) => (
                                  <tr
                                    key={groupedAnswer.key}
                                    className={
                                      groupedAnswer.isCorrect
                                        ? "bg-emerald-500/10"
                                        : undefined
                                    }
                                  >
                                    <td className={quizTheme.tableCell}>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span>{groupedAnswer.answer}</span>
                                        {groupedAnswer.isCorrect ? (
                                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                            ✓ Correct
                                          </span>
                                        ) : null}
                                      </div>
                                    </td>
                                    <td className={quizTheme.tableCell}>
                                      {groupedAnswer.voters.length === 0 ? (
                                        <span className="text-white/45">No votes</span>
                                      ) : (
                                        groupedAnswer.voters.join(", ")
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
