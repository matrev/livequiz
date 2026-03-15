import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizResultsPage from '../page';
import { renderWithProviders } from '@/test/testUtils';
import { useQuery } from '@apollo/client/react';

const mockPush = jest.fn();
const mockUseParams = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockUseParams(),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/generated/types', () => ({
  QuestionType: {
    MultipleChoice: 'MULTIPLE_CHOICE',
    TrueFalse: 'TRUE_FALSE',
    ShortAnswer: 'SHORT_ANSWER',
    Numerical: 'NUMERICAL',
  },
}));

const quizData = {
  getQuiz: {
    id: 10,
    title: 'Science Quiz',
    questions: [
      {
        id: 1,
        text: 'What is H2O?',
        questionType: 'MULTIPLE_CHOICE',
        correctAnswer: 'Water',
        options: ['Water', 'Oxygen', 'Hydrogen'],
      },
      {
        id: 2,
        text: 'Is the earth flat?',
        questionType: 'TRUE_FALSE',
        correctAnswer: 'false',
        options: null,
      },
    ],
  },
};

const entriesData = {
  getEntriesForQuiz: [
    {
      id: 1,
      name: 'Alice',
      userId: 100,
      answers: { '1': 'Water', '2': 'false' },
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 2,
      name: 'Bob',
      userId: 101,
      answers: { '1': 'Oxygen', '2': 'true' },
      updatedAt: '2026-03-01T11:00:00.000Z',
    },
  ],
};

describe('QuizResultsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ joinCode: 'SCI01' });
  });

  it('renders invalid join-code state', () => {
    mockUseParams.mockReturnValue({ joinCode: '' });

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined })
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined });

    renderWithProviders(<QuizResultsPage />);

    expect(screen.getByText('Invalid join code.')).toBeInTheDocument();
  });

  it('renders quiz loading state', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: true, error: undefined, data: undefined })
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined });

    renderWithProviders(<QuizResultsPage />);

    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('renders quiz error state', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: new Error('Network error'), data: undefined })
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined });

    renderWithProviders(<QuizResultsPage />);

    expect(screen.getByText('Error loading quiz: Network error')).toBeInTheDocument();
  });

  it('renders quiz not found state', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: { getQuiz: null } })
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined });

    renderWithProviders(<QuizResultsPage />);

    expect(screen.getByText('Quiz not found.')).toBeInTheDocument();
  });

  it('renders entries loading state', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: quizData })
      .mockReturnValueOnce({ loading: true, error: undefined, data: undefined });

    renderWithProviders(<QuizResultsPage />);

    expect(screen.getByText('Loading results...')).toBeInTheDocument();
  });

  it('renders questions with correct answers and participant responses', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: quizData })
      .mockReturnValueOnce({ loading: false, error: undefined, data: entriesData });

    renderWithProviders(<QuizResultsPage />);

    expect(screen.getByText('Science Quiz · Results')).toBeInTheDocument();

    // Questions and correct answers
    expect(screen.getByText('Q1. What is H2O?')).toBeInTheDocument();
    expect(screen.getByText('Q2. Is the earth flat?')).toBeInTheDocument();
    expect(screen.getByText('Correct answer: Water')).toBeInTheDocument();
    expect(screen.getByText('Correct answer: false')).toBeInTheDocument();

    // Participant names appear (once per question table)
    expect(screen.getAllByText('Alice')).toHaveLength(2);
    expect(screen.getAllByText('Bob')).toHaveLength(2);

    // Alice's correct answer for Q1
    expect(screen.getByText('Water')).toBeInTheDocument();
    // Bob's wrong answer for Q1
    expect(screen.getByText('Oxygen')).toBeInTheDocument();

    // Correctness indicators
    const correctMarkers = screen.getAllByText('✓ Correct');
    const incorrectMarkers = screen.getAllByText('✗ Incorrect');
    expect(correctMarkers.length).toBe(2); // Alice got both right
    expect(incorrectMarkers.length).toBe(2); // Bob got both wrong
  });

  it('navigates to leaderboard on button click', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: quizData })
      .mockReturnValueOnce({ loading: false, error: undefined, data: entriesData });

    renderWithProviders(<QuizResultsPage />);

    await user.click(screen.getByRole('button', { name: 'View leaderboard' }));
    expect(mockPush).toHaveBeenCalledWith('/quiz/leaderboard/SCI01');
  });

  it('navigates back to quizzes on button click', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: quizData })
      .mockReturnValueOnce({ loading: false, error: undefined, data: entriesData });

    renderWithProviders(<QuizResultsPage />);

    await user.click(screen.getByRole('button', { name: 'Back to quizzes' }));
    expect(mockPush).toHaveBeenCalledWith('/quiz/join');
  });

  it('renders no-responses state when there are no entries', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: quizData })
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: { getEntriesForQuiz: [] },
      });

    renderWithProviders(<QuizResultsPage />);

    expect(screen.getAllByText('No responses yet.')).toHaveLength(2); // one per question
  });

  it('renders no-questions state', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: { getQuiz: { id: 10, title: 'Empty Quiz', questions: [] } },
      })
      .mockReturnValueOnce({ loading: false, error: undefined, data: { getEntriesForQuiz: [] } });

    renderWithProviders(<QuizResultsPage />);

    expect(screen.getByText('This quiz has no questions yet.')).toBeInTheDocument();
  });

  describe('numerical questions - Price is Right rules', () => {
    const numericalQuizData = {
      getQuiz: {
        id: 20,
        title: 'Number Quiz',
        questions: [
          {
            id: 1,
            text: 'How many bones in the human body?',
            questionType: 'NUMERICAL',
            correctAnswer: '206',
            options: null,
          },
        ],
      },
    };

    it('marks closest answer without going over as correct', () => {
      (useQuery as unknown as jest.Mock)
        .mockReturnValueOnce({ loading: false, error: undefined, data: numericalQuizData })
        .mockReturnValueOnce({
          loading: false,
          error: undefined,
          data: {
            getEntriesForQuiz: [
              { id: 1, name: 'Alice', userId: 100, answers: { '1': '200' }, updatedAt: '2026-03-01T10:00:00.000Z' },
              { id: 2, name: 'Bob', userId: 101, answers: { '1': '100' }, updatedAt: '2026-03-01T11:00:00.000Z' },
              { id: 3, name: 'Carol', userId: 102, answers: { '1': '210' }, updatedAt: '2026-03-01T12:00:00.000Z' },
            ],
          },
        });

      renderWithProviders(<QuizResultsPage />);

      // Alice's answer (200) is closest without going over 206 → correct
      // Both mobile and desktop views render the marker, so 1 correct answer = 2 markers
      const correctMarkers = screen.getAllByText('✓ Correct');
      expect(correctMarkers).toHaveLength(2);

      // 200 should be in the document (Alice's answer, the winner)
      expect(screen.getAllByText('200').length).toBeGreaterThanOrEqual(1);
    });

    it('does not mark answers that go over as correct', () => {
      (useQuery as unknown as jest.Mock)
        .mockReturnValueOnce({ loading: false, error: undefined, data: numericalQuizData })
        .mockReturnValueOnce({
          loading: false,
          error: undefined,
          data: {
            getEntriesForQuiz: [
              { id: 1, name: 'Alice', userId: 100, answers: { '1': '210' }, updatedAt: '2026-03-01T10:00:00.000Z' },
              { id: 2, name: 'Bob', userId: 101, answers: { '1': '300' }, updatedAt: '2026-03-01T11:00:00.000Z' },
            ],
          },
        });

      renderWithProviders(<QuizResultsPage />);

      // Both answers go over 206, so none should be correct
      expect(screen.queryAllByText('✓ Correct')).toHaveLength(0);
    });

    it('marks exact match as correct', () => {
      (useQuery as unknown as jest.Mock)
        .mockReturnValueOnce({ loading: false, error: undefined, data: numericalQuizData })
        .mockReturnValueOnce({
          loading: false,
          error: undefined,
          data: {
            getEntriesForQuiz: [
              { id: 1, name: 'Alice', userId: 100, answers: { '1': '206' }, updatedAt: '2026-03-01T10:00:00.000Z' },
              { id: 2, name: 'Bob', userId: 101, answers: { '1': '200' }, updatedAt: '2026-03-01T11:00:00.000Z' },
            ],
          },
        });

      renderWithProviders(<QuizResultsPage />);

      // Alice's exact match (206) is the closest without going over → correct
      // Both mobile and desktop views render the marker
      const correctMarkers = screen.getAllByText('✓ Correct');
      expect(correctMarkers).toHaveLength(2);
    });

    it('marks tied answers as both correct', () => {
      (useQuery as unknown as jest.Mock)
        .mockReturnValueOnce({ loading: false, error: undefined, data: numericalQuizData })
        .mockReturnValueOnce({
          loading: false,
          error: undefined,
          data: {
            getEntriesForQuiz: [
              { id: 1, name: 'Alice', userId: 100, answers: { '1': '200' }, updatedAt: '2026-03-01T10:00:00.000Z' },
              { id: 2, name: 'Bob', userId: 101, answers: { '1': '200' }, updatedAt: '2026-03-01T11:00:00.000Z' },
            ],
          },
        });

      renderWithProviders(<QuizResultsPage />);

      // Both answered 200, which is closest without going over → both correct (grouped as one row)
      // Both mobile and desktop views render the marker
      const correctMarkers = screen.getAllByText('✓ Correct');
      expect(correctMarkers).toHaveLength(2);

      // Both voters should appear
      expect(screen.getAllByText('Alice, Bob')).toHaveLength(2);
    });
  });
});
