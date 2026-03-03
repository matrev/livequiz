import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditQuizPage from '../page';
import { renderWithProviders } from '@/test/testUtils';
import { useMutation, useQuery } from '@apollo/client/react';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: () => ({ joinCode: 'JOIN01' }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const mockQuizData = {
  getQuiz: {
    id: 1,
    joinCode: 'JOIN01',
    title: 'Weekly Quiz',
    description: 'A weekly quiz',
    deadline: null,
    questions: [
      {
        id: 1,
        text: 'Capital of Japan?',
        questionType: 'MULTIPLE_CHOICE',
        correctAnswer: 'Tokyo',
        options: ['Tokyo', 'Seoul'],
      },
    ],
  },
};

describe('EditQuizPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as unknown as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
  });

  it('renders loading state', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: true,
      error: undefined,
      data: undefined,
      refetch: jest.fn(),
    });

    renderWithProviders(<EditQuizPage />);

    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('renders quiz details and questions', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
      refetch: jest.fn(),
    });

    renderWithProviders(<EditQuizPage />);

    expect(screen.getByRole('heading', { name: 'Edit Quiz: Weekly Quiz' })).toBeInTheDocument();
    expect(screen.getByText('Capital of Japan?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Add Question' })).toBeInTheDocument();
  });

  it('renders quiz and routes to entries/list actions', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
      refetch: jest.fn(),
    });

    renderWithProviders(<EditQuizPage />);

    await user.click(screen.getByRole('button', { name: 'View Entries' }));
    expect(mockPush).toHaveBeenCalledWith('/quiz/entries/JOIN01');

    await user.click(screen.getByRole('button', { name: 'Back to List' }));
    expect(mockPush).toHaveBeenCalledWith('/quiz/edit');
  });

  it('shows quiz details edit form when Edit Details is clicked', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
      refetch: jest.fn(),
    });

    renderWithProviders(<EditQuizPage />);

    await user.click(screen.getByRole('button', { name: 'Edit Details' }));

    expect(screen.getByLabelText('Quiz Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Deadline (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('cancels quiz details editing when Cancel is clicked', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
      refetch: jest.fn(),
    });

    renderWithProviders(<EditQuizPage />);

    await user.click(screen.getByRole('button', { name: 'Edit Details' }));
    expect(screen.getByRole('button', { name: 'Save Details' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('button', { name: 'Save Details' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Details' })).toBeInTheDocument();
  });

  it('saves quiz details and calls updateQuiz mutation', async () => {
    const user = userEvent.setup();
    const mockUpdateQuiz = jest.fn().mockResolvedValue({});
    const mockRefetch = jest.fn().mockResolvedValue({});

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
      refetch: mockRefetch,
    });

    (useMutation as unknown as jest.Mock).mockImplementation((mutation) => {
      const mutationStr = mutation?.definitions?.[0]?.name?.value ?? '';
      if (mutationStr === 'UpdateQuiz') return [mockUpdateQuiz, { loading: false }];
      return [jest.fn(), { loading: false }];
    });

    renderWithProviders(<EditQuizPage />);

    await user.click(screen.getByRole('button', { name: 'Edit Details' }));

    const titleInput = screen.getByLabelText('Quiz Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Quiz Title');

    await user.click(screen.getByRole('button', { name: 'Save Details' }));

    await waitFor(() => {
      expect(mockUpdateQuiz).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({ title: 'Updated Quiz Title' }),
        })
      );
    });
  });

  it('shows add question form when + Add Question is clicked', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
      refetch: jest.fn(),
    });

    renderWithProviders(<EditQuizPage />);

    await user.click(screen.getByRole('button', { name: '+ Add Question' }));

    expect(screen.getByText('New Question')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Question' })).toBeInTheDocument();
  });

  it('shows Remove button on each question', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
      refetch: jest.fn(),
    });

    renderWithProviders(<EditQuizPage />);

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('shows no questions message when quiz has no questions', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        getQuiz: {
          ...mockQuizData.getQuiz,
          questions: [],
        },
      },
      refetch: jest.fn(),
    });

    renderWithProviders(<EditQuizPage />);

    expect(screen.getByText('No questions found for this quiz.')).toBeInTheDocument();
  });
});
