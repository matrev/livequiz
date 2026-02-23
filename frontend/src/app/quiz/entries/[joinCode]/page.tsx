"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { getEntriesForQuiz, getQuiz } from "@/graphql/queries";
import { QuestionType } from "@/generated/types";

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
    return <div style={{ padding: "24px" }}>Invalid join code.</div>;
  }

  if (quizLoading) {
    return <div style={{ padding: "24px" }}>Loading quiz...</div>;
  }

  if (quizError) {
    return (
      <div style={{ padding: "24px" }}>
        Error loading quiz: {quizError.message}
      </div>
    );
  }

  if (!quizData?.getQuiz) {
    return <div style={{ padding: "24px" }}>Quiz not found.</div>;
  }

  if (entriesLoading) {
    return <div style={{ padding: "24px" }}>Loading entries...</div>;
  }

  if (entriesError) {
    return (
      <div style={{ padding: "24px" }}>
        Error loading entries: {entriesError.message}
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "980px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>{quizData.getQuiz.title} · Entries</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => router.push(`/quiz/leaderboard/${joinCode}`)}
            style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#3b82f6",
              color: "white",
              cursor: "pointer",
            }}
          >
            View leaderboard
          </button>
          <button
            onClick={() => router.push("/quiz/edit")}
            style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#64748b",
              color: "white",
              cursor: "pointer",
            }}
          >
            Back to quizzes
          </button>
        </div>
      </div>

      {!entriesData?.getEntriesForQuiz?.length ? (
        <p>No entries submitted for this quiz yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {entriesData.getEntriesForQuiz.map((entry, index) => (
            <section
              key={
                entry.id ?? `${entry.name}-${entry.userId ?? "anon"}-${index}`
              }
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "14px",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "18px" }}>{entry.name}</h2>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                  User ID: {entry.userId ?? "anonymous"} · Updated{" "}
                  {new Date(String(entry.updatedAt)).toLocaleString()}
                </p>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {questions.map((question, questionIndex) => {
                  const answer = getAnswerValue(entry.answers, question.id);

                  return (
                    <div
                      key={question.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "10px",
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        Q{questionIndex + 1}. {question.text}
                      </p>
                      <p
                        style={{
                          margin: "6px 0 0 0",
                          color: answer ? "#111827" : "#6b7280",
                        }}
                      >
                        {answer || "No answer submitted"}
                      </p>
                      <p
                        style={{
                          margin: "6px 0 0 0",
                          color: "#6b7280",
                          fontSize: "12px",
                        }}
                      >
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
  );
}
