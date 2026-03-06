'use client'

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Question, QuestionInput as QuestionInputType, QuestionType } from "@/generated/types";
import { useParams, useRouter } from "next/navigation";
import { getQuiz } from "@/graphql/queries";
import { updateQuestion, updateQuiz, createQuestion, deleteQuestion } from "@/graphql/mutations";
import QuestionEditCard from "@/components/QuestionEditCard";
import QuestionInputComponent from "@/components/QuestionInput";
import { quizTheme } from "../../theme";

const createEmptyQuestionDraft = (): QuestionInputType => ({
    text: '',
    questionType: QuestionType.MultipleChoice,
    options: ['Option 1', 'Option 2'],
    correctAnswer: '',
});

export default function EditQuizPage() {
    const params = useParams();
    const router = useRouter();
    const joinCode = params.joinCode as string;

    // Question editing state
    const [editingById, setEditingById] = useState<Record<number, boolean>>({});
    const [draftById, setDraftById] = useState<Record<number, QuestionInputType>>({});
    const [savingById, setSavingById] = useState<Record<number, boolean>>({});
    const [questionSuccessMessage, setQuestionSuccessMessage] = useState<Record<number,string>>({});
    const [questionErrorMessage, setQuestionErrorMessage] = useState<Record<number, string>>({});
    const successTimeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    // Quiz metadata editing state
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [detailsDraft, setDetailsDraft] = useState({ title: '', description: '', deadline: '' });
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [detailsSuccessMessage, setDetailsSuccessMessage] = useState('');
    const [detailsErrorMessage, setDetailsErrorMessage] = useState('');
    const detailsSuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // New question state
    const [newQuestionDraft, setNewQuestionDraft] = useState<QuestionInputType>(createEmptyQuestionDraft());
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [addQuestionError, setAddQuestionError] = useState('');

    const { loading, error, data, refetch } = useQuery(getQuiz, {
        variables: { joinCode }
    });

    const [updateQuestionMutation] = useMutation(updateQuestion);
    const [updateQuizMutation] = useMutation(updateQuiz);
    const [createQuestionMutation] = useMutation(createQuestion);
    const [deleteQuestionMutation] = useMutation(deleteQuestion);

    useEffect(() => {
        const timeoutMap = successTimeoutsRef.current;
        return () => {
            Object.values(timeoutMap).forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
        };
    }, []);

    useEffect(() => {
        return () => {
            if (detailsSuccessTimeoutRef.current) {
                clearTimeout(detailsSuccessTimeoutRef.current);
            }
        };
    }, []);

    // -- Quiz metadata handlers --
    const handleEditDetails = () => {
        const quiz = data?.getQuiz;
        if (!quiz) return;
        const deadlineValue = quiz.deadline
            ? new Date(quiz.deadline).toISOString().slice(0, 16)
            : '';
        setDetailsDraft({
            title: quiz.title,
            description: quiz.description ?? '',
            deadline: deadlineValue,
        });
        setDetailsSuccessMessage('');
        setDetailsErrorMessage('');
        setIsEditingDetails(true);
    };

    const handleCancelDetails = () => {
        setIsEditingDetails(false);
        setDetailsErrorMessage('');
    };

    const handleSaveDetails = async () => {
        if (!data?.getQuiz?.id) return;
        if (!detailsDraft.title.trim()) {
            setDetailsErrorMessage('Quiz title is required.');
            return;
        }
        setIsSavingDetails(true);
        setDetailsErrorMessage('');
        try {
            let deadlineIso: string | null = null;
            if (detailsDraft.deadline) {
                const parsedDate = new Date(detailsDraft.deadline);
                if (isNaN(parsedDate.getTime())) {
                    setDetailsErrorMessage('Invalid deadline date. Please enter a valid date and time.');
                    setIsSavingDetails(false);
                    return;
                }
                deadlineIso = parsedDate.toISOString();
            }
            await updateQuizMutation({
                variables: {
                    id: data.getQuiz.id,
                    title: detailsDraft.title.trim(),
                    description: detailsDraft.description.trim() || null,
                    deadline: deadlineIso,
                },
            });
            setIsEditingDetails(false);
            setDetailsSuccessMessage('Quiz details updated successfully!');
            if (detailsSuccessTimeoutRef.current) {
                clearTimeout(detailsSuccessTimeoutRef.current);
            }
            detailsSuccessTimeoutRef.current = setTimeout(() => {
                setDetailsSuccessMessage('');
            }, 3000);
            await refetch();
        } catch {
            setDetailsErrorMessage('Unable to update quiz details. Please try again.');
        } finally {
            setIsSavingDetails(false);
        }
    };

    // -- Question editing handlers --
    const handleEditToggle = (questionId: number) => {
        const question = data?.getQuiz?.questions?.find((q) => q.id === questionId);
        if (!question) return;

        setEditingById(prev => {
            const nextIsEditing = !prev[questionId];

            if (nextIsEditing) {
                setDraftById(draftPrev => ({
                    ...draftPrev,
                    [questionId]: draftPrev[questionId] ?? {
                        text: question.text,
                        correctAnswer: question.correctAnswer || '',
                        questionType: question.questionType,
                        options: question.options || []
                    }
                }));

                setQuestionSuccessMessage(successPrev => ({
                    ...successPrev,
                    [questionId]: ""
                }));
            }

            setQuestionErrorMessage(errorPrev => ({
                ...errorPrev,
                [questionId]: ""
            }));

            return {
                ...prev,
                [questionId]: nextIsEditing
            };
        });
    };

    const handleQuestionChange = (questionId: number, updatedQuestion: QuestionInputType) => {
        setDraftById(prev => ({
            ...prev,
            [questionId]: updatedQuestion
        }));

        setQuestionErrorMessage(prev => ({
            ...prev,
            [questionId]: ""
        }));
    };

    const handleSaveQuestion = async (questionId: number) => {
        const questionDraft = draftById[questionId];
        if (!questionDraft) return;

        setSavingById(prev => ({ ...prev, [questionId]: true }));
        setQuestionErrorMessage(prev => ({ ...prev, [questionId]: "" }));

        try {
            await updateQuestionMutation({
                variables: {
                    id: questionId,
                    text: questionDraft.text,
                    correctAnswer: questionDraft.correctAnswer,
                    questionType: questionDraft.questionType,
                    options: questionDraft.options
                },
                update: (cache, { data: mutationData }) => {
                    if (!mutationData?.updateQuestion) return

                    cache.modify({
                        id: cache.identify(mutationData.updateQuestion),
                        fields: {
                            text: () => mutationData.updateQuestion.text,
                            correctAnswer: () => mutationData.updateQuestion.correctAnswer,
                            questionType: () => mutationData.updateQuestion.questionType,
                            options: () => mutationData.updateQuestion.options,
                        }
                    });
                }
            });

            setEditingById((prev) => ({ ...prev, [questionId]: false }));
            setQuestionSuccessMessage(prev => ({ ...prev, [questionId]: "Question updated successfully!" }));
            setQuestionErrorMessage(prev => ({ ...prev, [questionId]: "" }));

            if (successTimeoutsRef.current[questionId]) {
                clearTimeout(successTimeoutsRef.current[questionId]);
            }
            successTimeoutsRef.current[questionId] = setTimeout(() => {
                setQuestionSuccessMessage(prev => ({ ...prev, [questionId]: "" }));
            }, 3000);
        } catch (err) {
            console.error("Error updating question:", err);
            setEditingById(prev => ({ ...prev, [questionId]: true }));
            setQuestionErrorMessage(prev => ({
                ...prev,
                [questionId]: "Unable to update question. Please try again."
            }));
        } finally {
            setSavingById(prev => ({ ...prev, [questionId]: false }));
        }
    };

    // -- Remove question handler --
    const handleRemoveQuestion = async (questionId: number) => {
        const confirmed = window.confirm("Are you sure you want to remove this question?");
        if (!confirmed) return;

        try {
            await deleteQuestionMutation({ variables: { id: questionId } });
            await refetch();
        } catch (err) {
            console.error("Error removing question:", err);
            // Surface a user-facing error on the specific question so the user knows the removal failed
            setQuestionErrorMessage(prev => ({
                ...prev,
                [questionId]: "Unable to remove question. Please try again."
            }));
        }
    };

    // -- Add question handler --
    const handleAddQuestion = async () => {
        if (!data?.getQuiz?.id) return;
        if (!newQuestionDraft.text.trim()) {
            setAddQuestionError('Question text is required.');
            return;
        }
        setAddQuestionError('');
        try {
            await createQuestionMutation({
                variables: {
                    text: newQuestionDraft.text.trim(),
                    questionType: newQuestionDraft.questionType,
                    correctAnswer: newQuestionDraft.correctAnswer || undefined,
                    quizId: data.getQuiz.id,
                    options: newQuestionDraft.options,
                },
            });
            setIsAddingQuestion(false);
            setNewQuestionDraft(createEmptyQuestionDraft());
            await refetch();
        } catch (err) {
            console.error("Error adding question:", err);
            setAddQuestionError('Unable to add question. Please try again.');
        }
    };

    const handleCancelAddQuestion = () => {
        setIsAddingQuestion(false);
        setNewQuestionDraft(createEmptyQuestionDraft());
        setAddQuestionError('');
    };

    if (loading) return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Loading quiz...</div>;
    if (error) return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Error loading quiz: {error.message}</div>;
    if (!data?.getQuiz) return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Quiz not found</div>;

    const quiz = data.getQuiz;
    const questionsWithId = (quiz.questions ?? []).filter(
        (question): question is Omit<Question, 'quizId'> & { id: number } => question.id != null
    );

    return (
        <div className={quizTheme.shell}>
            <div className={quizTheme.page}>
                <div className={quizTheme.header}>
                    <h1 className={quizTheme.title}>Edit Quiz: {quiz.title}</h1>
                    <div className={quizTheme.inlineActions}>
                        <button
                            onClick={() => router.push(`/quiz/entries/${joinCode}`)}
                            className={`${quizTheme.buttonPrimary} w-full sm:w-auto`}
                        >
                            View Entries
                        </button>
                        <button
                            onClick={() => router.push('/quiz/edit')}
                            className={`${quizTheme.buttonOutline} w-full sm:w-auto`}
                        >
                            Back to List
                        </button>
                    </div>
                </div>

                {/* Quiz Details Section */}
                <div className={`${quizTheme.panel} mb-6`}>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className={quizTheme.sectionTitle}>Quiz Details</h2>
                        {!isEditingDetails && (
                            <button
                                onClick={handleEditDetails}
                                className={`${quizTheme.buttonPrimary} w-full sm:w-auto`}
                            >
                                Edit Details
                            </button>
                        )}
                    </div>

                    {detailsErrorMessage && (
                        <div role="alert" aria-live="assertive" className={quizTheme.noticeError}>
                            {detailsErrorMessage}
                        </div>
                    )}
                    {detailsSuccessMessage && (
                        <div role="status" aria-live="polite" className={quizTheme.noticeSuccess}>
                            {detailsSuccessMessage}
                        </div>
                    )}

                    {isEditingDetails ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="EditQuizTitle" className={quizTheme.label}>Quiz Title</label>
                                <input
                                    type="text"
                                    id="EditQuizTitle"
                                    value={detailsDraft.title}
                                    onChange={(e) => setDetailsDraft(prev => ({ ...prev, title: e.target.value }))}
                                    className={`${quizTheme.input} mb-0`}
                                    placeholder="Enter quiz title"
                                />
                            </div>
                            <div>
                                <label htmlFor="EditQuizDescription" className={quizTheme.label}>Description (optional)</label>
                                <textarea
                                    id="EditQuizDescription"
                                    value={detailsDraft.description}
                                    onChange={(e) => setDetailsDraft(prev => ({ ...prev, description: e.target.value }))}
                                    className={`${quizTheme.textarea}`}
                                    placeholder="Enter a description for your quiz"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label htmlFor="EditQuizDeadline" className={quizTheme.label}>Deadline (optional)</label>
                                <input
                                    type="datetime-local"
                                    id="EditQuizDeadline"
                                    value={detailsDraft.deadline}
                                    onChange={(e) => setDetailsDraft(prev => ({ ...prev, deadline: e.target.value }))}
                                    className={`${quizTheme.input} mb-0`}
                                />
                            </div>
                            <div className={quizTheme.inlineActions}>
                                <button
                                    onClick={handleSaveDetails}
                                    disabled={isSavingDetails}
                                    className={`${quizTheme.buttonPrimary} w-full sm:w-auto`}
                                >
                                    {isSavingDetails ? 'Saving...' : 'Save Details'}
                                </button>
                                <button
                                    onClick={handleCancelDetails}
                                    disabled={isSavingDetails}
                                    className={`${quizTheme.buttonOutline} w-full sm:w-auto`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className={quizTheme.label}>Title</label>
                                <p className="rounded-xl border border-white/20 bg-slate-950/45 p-3 text-sm text-white/95 sm:text-base">
                                    {quiz.title}
                                </p>
                            </div>
                            <div>
                                <label className={quizTheme.label}>Description</label>
                                <p className="rounded-xl border border-white/20 bg-slate-950/45 p-3 text-sm text-white/95 sm:text-base">
                                    {quiz.description || <span className="italic text-white/50">No description</span>}
                                </p>
                            </div>
                            <div>
                                <label className={quizTheme.label}>Deadline</label>
                                <p className="rounded-xl border border-white/20 bg-slate-950/45 p-3 text-sm text-white/95 sm:text-base">
                                    {quiz.deadline
                                        ? new Date(quiz.deadline).toLocaleString()
                                        : <span className="italic text-white/50">No deadline set</span>
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Questions Section */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className={quizTheme.sectionTitle}>Questions</h2>
                </div>

                {questionsWithId.length === 0 ? (
                    <p className={`${quizTheme.mutedText} mb-4`}>No questions found for this quiz.</p>
                ) : (
                    <div className="space-y-5 mb-5">
                        {questionsWithId.map((q, index: number) => {
                            const isEditing = editingById[q.id] || false;
                            const isSaving = savingById[q.id] || false;
                            const questionDraft = draftById[q.id] ?? {
                                text: q.text,
                                correctAnswer: q.correctAnswer || '',
                                questionType: q.questionType,
                                options: q.options || []
                            };

                            return (
                                <QuestionEditCard
                                    key={q.id}
                                    question={q}
                                    index={index}
                                    isEditing={isEditing}
                                    isSaving={isSaving}
                                    questionDraft={questionDraft}
                                    questionErrorMessage={questionErrorMessage[q.id] || ""}
                                    questionSuccessMessage={questionSuccessMessage[q.id] || ""}
                                    onSave={handleSaveQuestion}
                                    onToggleEdit={handleEditToggle}
                                    onChange={handleQuestionChange}
                                    onRemove={handleRemoveQuestion}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Add Question Section */}
                {isAddingQuestion ? (
                    <div className={`${quizTheme.panel} mb-5`}>
                        <h3 className={`${quizTheme.sectionTitle} mb-4`}>New Question</h3>
                        {addQuestionError && (
                            <div role="alert" aria-live="assertive" className={quizTheme.noticeError}>
                                {addQuestionError}
                            </div>
                        )}
                        <QuestionInputComponent
                            question={newQuestionDraft}
                            index={questionsWithId.length}
                            onChange={setNewQuestionDraft}
                        />
                        <div className={`${quizTheme.inlineActions} mt-4`}>
                            <button
                                onClick={handleAddQuestion}
                                className={`${quizTheme.buttonPrimary} w-full sm:w-auto`}
                            >
                                Add Question
                            </button>
                            <button
                                onClick={handleCancelAddQuestion}
                                className={`${quizTheme.buttonOutline} w-full sm:w-auto`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingQuestion(true)}
                        className={`${quizTheme.buttonOutline} w-full sm:w-auto`}
                    >
                        + Add Question
                    </button>
                )}
            </div>
        </div>
    );
}
