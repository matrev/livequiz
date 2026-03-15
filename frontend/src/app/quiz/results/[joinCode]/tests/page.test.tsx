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
});
