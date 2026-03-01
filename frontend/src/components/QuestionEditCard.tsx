'use client'

import { Question, QuestionInput as QuestionInputType, QuestionType } from "@/generated/types";
import QuestionEditor from "@/components/QuestionEditor";
import { quizTheme } from "@/app/quiz/theme";

type QuestionWithId = Omit<Question, 'quizId'> & { id: number };

type QuestionEditCardProps = {
    question: QuestionWithId;
    index: number;
    isEditing: boolean;
    isSaving: boolean;
    questionDraft: QuestionInputType;
    questionErrorMessage: string;
    questionSuccessMessage: string;
    onSave: (questionId: number) => void;
    onToggleEdit: (questionId: number) => void;
    onChange: (questionId: number, updatedQuestion: QuestionInputType) => void;
};

export default function QuestionEditCard({
    question,
    index,
    isEditing,
    isSaving,
    questionDraft,
    questionErrorMessage,
    questionSuccessMessage,
    onSave,
    onToggleEdit,
    onChange
}: QuestionEditCardProps) {
    return (
        <div
            key={question.id}
            className={`${quizTheme.panel} mb-5`}
        >
            {questionErrorMessage && (
                <div
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    className={quizTheme.noticeError}>
                    {questionErrorMessage}
                </div>
            )}
            {questionSuccessMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className={quizTheme.noticeSuccess}>
                    {questionSuccessMessage}
                </div>
            )}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className={quizTheme.inlineActions}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => onSave(question.id)}
                                disabled={isSaving}
                                className={`${quizTheme.buttonPrimary} w-full sm:w-auto`}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => onToggleEdit(question.id)}
                                disabled={isSaving}
                                className={`${quizTheme.buttonOutline} w-full sm:w-auto`}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onToggleEdit(question.id)}
                            className={`${quizTheme.buttonPrimary} w-full sm:w-auto`}
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <QuestionEditor
                    question={questionDraft}
                    index={index}
                    onChange={(updated) => onChange(question.id, updated)}
                />
            ) : (
                <>
                    <div className="mb-4">
                        <label className={quizTheme.label}>
                            Question Text:
                        </label>
                        <p className="rounded-xl border border-white/20 bg-slate-950/45 p-3 text-sm text-white/95 sm:text-base">
                            {question.text}
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className={quizTheme.label}>
                            Question Type:
                        </label>
                        <p className="rounded-xl border border-white/20 bg-slate-950/45 p-3 text-sm text-white/95 sm:text-base">
                            {question.questionType}
                        </p>
                    </div>

                    {question.questionType === QuestionType.MultipleChoice && (
                        <div className="mb-4">
                            <label className={quizTheme.label}>
                                Options:
                            </label>
                            <ul className="list-inside list-disc rounded-xl border border-white/20 bg-slate-950/45 p-3 text-sm text-white/95 sm:text-base">
                                {question.options?.map((option: string | null, idx: number) => (
                                    <li key={idx} className="mb-1">{option}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className={quizTheme.label}>
                            Correct Answer:
                        </label>
                        <p className={`rounded-xl border p-3 font-semibold ${question.correctAnswer
                            ? "border-cyan-300/35 bg-cyan-400/15 text-cyan-100"
                            : "border-amber-300/35 bg-amber-400/15 text-amber-100"
                            }`}>
                            {question.correctAnswer || 'No correct answer set'}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
