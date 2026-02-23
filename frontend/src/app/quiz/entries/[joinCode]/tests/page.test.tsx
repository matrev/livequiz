import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizEntriesPage from '../page';
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

describe('QuizEntriesPage', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ joinCode: 'JOIN01' });
  });

  it('renders invalid join-code state', () => {
    mockUseParams.mockReturnValue({ joinCode: '' });

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined })
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined });

    renderWithProviders(<QuizEntriesPage />);

    expect(screen.getByText('Invalid join code.')).toBeInTheDocument();
  });

  it('renders quiz loading state', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: true, error: undefined, data: undefined })
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined });

    renderWithProviders(<QuizEntriesPage />);

    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('renders entries and routes from action buttons', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: {
          getQuiz: {
            id: 22,
            title: 'General Knowledge',
            questions: [
              {
                id: 1,
                text: 'Sky color?',
                questionType: 'MULTIPLE_CHOICE',
              },
            ],
          },
        },
      })
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: {
          getEntriesForQuiz: [
            {
              id: 7,
              name: 'Alice',
              userId: 99,
              answers: { '1': 'Blue' },
              updatedAt: '2026-02-20T10:00:00.000Z',
            },
          ],
        },
      });

    renderWithProviders(<QuizEntriesPage />);

    expect(screen.getByText('General Knowledge · Entries')).toBeInTheDocument();
    expect(screen.getByText('Q1. Sky color?')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View leaderboard' }));
    expect(mockPush).toHaveBeenCalledWith('/quiz/leaderboard/JOIN01');

    await user.click(screen.getByRole('button', { name: 'Back to quizzes' }));
    expect(mockPush).toHaveBeenCalledWith('/quiz/edit');
  });
});
