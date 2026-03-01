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

export default function QuizEntriesPage() {
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

  if (!hasValidJoinCode) {
    return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Invalid join code.</div>;
  }

  if (quizLoading) {
    return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Loading quiz...</div>;
  }

  if (quizError) {
    return (
      <div className={`${quizTheme.shell} ${quizTheme.page}`}>
        Error loading quiz: {quizError.message}
      </div>
    );
  }

  if (!quizData?.getQuiz) {
    return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Quiz not found.</div>;
  }

  if (entriesLoading) {
    return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Loading entries...</div>;
  }

  if (entriesError) {
    return (
      <div className={`${quizTheme.shell} ${quizTheme.page}`}>
        Error loading entries: {entriesError.message}
      </div>
    );
  }

  return (
    <div className={quizTheme.shell}>
      <div className={quizTheme.page}>
      <div className={quizTheme.header}>
        <h1 className={quizTheme.title}>{quizData.getQuiz.title} · Entries</h1>
        <div className={quizTheme.inlineActions}>
          <button
            onClick={() => router.push(`/quiz/leaderboard/${joinCode}`)}
            className={quizTheme.buttonPrimary}
          >
            View leaderboard
          </button>
          <button
            onClick={() => router.push("/quiz/edit")}
            className={quizTheme.buttonOutline}
          >
            Back to quizzes
          </button>
        </div>
      </div>

      {!entriesData?.getEntriesForQuiz?.length ? (
        <p className={quizTheme.mutedText}>No entries submitted for this quiz yet.</p>
      ) : (
        <div className="grid gap-4">
          {entriesData.getEntriesForQuiz.map((entry, index) => (
            <section
              key={
                entry.id ?? `${entry.name}-${entry.userId ?? "anon"}-${index}`
              }
              className={quizTheme.itemCard}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-lg font-semibold text-white">{entry.name}</h2>
                <p className="m-0 text-xs text-white/65">
                  {new Date(String(entry.updatedAt)).toLocaleString()}
                </p>
              </div>

              <div className="grid gap-2">
                {questions.map((question, questionIndex) => {
                  const answer = getAnswerValue(entry.answers, question.id);

                  return (
                    <div
                      key={question.id}
                      className="rounded-xl border border-white/15 bg-slate-950/40 p-3"
                    >
                      <p className="m-0 font-semibold text-white">
                        Q{questionIndex + 1}. {question.text}
                      </p>
                      <p className={`mt-1 ${answer ? "text-white/95" : "text-white/55"}`}>
                        {answer || "No answer submitted"}
                      </p>
                      <p className="mt-1 text-xs text-white/55">
                        Type:{" "}
                        {question.questionType === QuestionType.MultipleChoice
                          ? "Multiple Choice"
                          : question.questionType === QuestionType.TrueFalse
                            ? "True/False"
                            : "Short Answer"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
