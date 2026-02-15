'use client'

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { QuestionType } from "@/generated/types";
import { getEntryForUser, getQuiz } from "@/graphql/queries";
import { upsertEntry } from "@/graphql/mutations";

type SignedInUser = {
  id: number;
  email: string;
};

type UserAnswers = Record<number, string>;

export default function QuizResponseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = Number(params.id);

  const [user, setUser] = useState<SignedInUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { loading, data, error: queryError } = useQuery(getQuiz, {
    variables: { id: quizId },
  });

  const { data: entryData } = useQuery(getEntryForUser, {
    variables: { quizId, userId: user?.id ?? 0 },
    skip: !user?.id,
  });

  const [upsertEntryMutation, { loading: savingEntry }] = useMutation(upsertEntry);

  useEffect(() => {
    let isActive = true;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (isActive) {
            setError("Please sign in to view your responses.");
          }
          return;
        }

        const payload = (await response.json()) as { user?: SignedInUser };
        if (payload.user && isActive) {
          setUser(payload.user);
        }
      } catch (loadError) {
        if (isActive) {
          setError("Unable to load your responses.");
        }
      }
    };

    loadUser();
    return () => {
      isActive = false;
    };
  }, [quizId]);

  const quizTitle = useMemo(() => data?.getQuiz?.title ?? "", [data]);

  const answers = useMemo(() => {
    if (!entryData?.getEntryForUser?.answers) {
      return {};
    }

    return Object.entries(entryData.getEntryForUser.answers as Record<string, string>).reduce<UserAnswers>(
      (acc, [key, value]) => {
        const questionId = Number(key);
        if (!Number.isNaN(questionId)) {
          acc[questionId] = value;
        }
        return acc;
      },
      {}
    );
  }, [entryData]);

  const [editedAnswers, setEditedAnswers] = useState<UserAnswers>({});

  useEffect(() => {
    setEditedAnswers(answers);
  }, [answers]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setEditedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSave = () => {
    if (!user) {
      setError("Please sign in to save your responses.");
      return;
    }

    if (!data?.getQuiz) {
      setError("Quiz not found.");
      return;
    }

    upsertEntryMutation({
      variables: {
        quizId,
        userId: user.id,
        title: data.getQuiz.title,
        answers: Object.fromEntries(
          Object.entries(editedAnswers).map(([key, value]) => [String(key), value])
        ),
      },
    })
      .then(() => {
        setSuccess("Responses updated.");
        setTimeout(() => setSuccess(null), 2500);
      })
      .catch(() => {
        setError("Unable to save responses.");
      });
  };

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading quiz...</div>;
  }

  if (queryError) {
    return (
      <div style={{ padding: "24px" }}>
        Error loading quiz: {queryError.message}
      </div>
    );
  }

  if (!data?.getQuiz) {
    return <div style={{ padding: "24px" }}>Quiz not found.</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "820px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <button onClick={() => router.push("/quiz/responses")}>Back</button>
        <button 
          onClick={() => router.push(`/quiz/leaderboard/${quizId}`)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          View Leaderboard
        </button>
      </div>
      <h1 style={{ marginTop: "16px" }}>{quizTitle}</h1>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {success ? <p style={{ color: "#16a34a" }}>{success}</p> : null}
      {data.getQuiz.questions?.map((question, index) => {
        if (!question.id) {
          return null;
        }
        return (
          <div
            key={question.id}
            style={{
              marginTop: "20px",
              padding: "16px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
            }}
          >
            <h3>Question {index + 1}</h3>
            <p style={{ fontSize: "16px" }}>{question.text}</p>
            {question.questionType === QuestionType.MultipleChoice && question.options ? (
              <div>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} style={{ display: "block", marginBottom: "8px" }}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option ?? ""}
                      checked={editedAnswers[question.id!] === option}
                      onChange={(event) =>
                        handleAnswerChange(question.id!, event.target.value)
                      }
                      style={{ marginRight: "8px" }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : question.questionType === QuestionType.TrueFalse ? (
              <div>
                {["True", "False"].map((option) => (
                  <label key={option} style={{ display: "block", marginBottom: "8px" }}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={editedAnswers[question.id!] === option}
                      onChange={(event) =>
                        handleAnswerChange(question.id!, event.target.value)
                      }
                      style={{ marginRight: "8px" }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={editedAnswers[question.id] ?? ""}
                onChange={(event) =>
                  handleAnswerChange(question.id!, event.target.value)
                }
                placeholder="Enter your answer"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
              />
            )}
          </div>
        );
      })}
      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button
          onClick={handleSave}
          disabled={savingEntry}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0ea5e9",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          {savingEntry ? "Saving..." : "Save updates"}
        </button>
        <button
          onClick={() => router.push("/quiz/join")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#64748b",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Back to quizzes
        </button>
      </div>
    </div>
  );
}
