"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { getEntriesForQuiz, getQuiz } from "@/graphql/queries";
import { QuestionType } from "@/generated/types";
import { quizTheme } from "../../theme";

type EntryAnswers = Record<string, string>;

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

const isAnswerCorrect = (
  userAnswer: string,
  correctAnswer: string | null | undefined,
  questionType: QuestionType,
): boolean => {
  if (!correctAnswer || !userAnswer) return false;

  if (questionType === QuestionType.Numerical) {
    const submitted = parseFloat(userAnswer);
    const correct = parseFloat(correctAnswer);
    if (isNaN(submitted) || isNaN(correct)) return false;
    return submitted === correct;
  }

  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
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
            <button
              onClick={() => router.push("/quiz/join")}
              className={`${quizTheme.buttonOutline} w-full sm:w-auto`}
            >
              Back to quizzes
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
                <div className="mb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="m-0 text-base font-semibold text-white sm:text-lg">
                      Q{questionIndex + 1}. {question.text}
                    </h2>
                    <span className="shrink-0 text-xs text-white/55">
                      {formatQuestionType(question.questionType)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-emerald-300">
                    Correct answer: {question.correctAnswer ?? "Not set"}
                  </p>
                </div>

                {entries.length === 0 ? (
                  <p className="text-sm text-white/55">
                    No responses yet.
                  </p>
                ) : (
                  <div className={quizTheme.tableWrap}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className={quizTheme.tableHeader}>
                            Participant
                          </th>
                          <th className={quizTheme.tableHeader}>Answer</th>
                          <th className={quizTheme.tableHeader}>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, entryIndex) => {
                          const answer = getAnswerValue(
                            entry.answers,
                            question.id,
                          );
                          const correct = isAnswerCorrect(
                            answer,
                            question.correctAnswer,
                            question.questionType,
                          );

                          return (
                            <tr
                              key={
                                entry.id ??
                                `${entry.name}-${entry.userId ?? "anon"}-${entryIndex}`
                              }
                            >
                              <td className={quizTheme.tableCell}>
                                {entry.name}
                              </td>
                              <td className={quizTheme.tableCell}>
                                {answer || (
                                  <span className="text-white/45">
                                    No answer
                                  </span>
                                )}
                              </td>
                              <td className={quizTheme.tableCell}>
                                {!answer ? (
                                  <span className="text-white/45">—</span>
                                ) : correct ? (
                                  <span className="font-medium text-emerald-400">
                                    ✓ Correct
                                  </span>
                                ) : (
                                  <span className="font-medium text-red-400">
                                    ✗ Incorrect
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
