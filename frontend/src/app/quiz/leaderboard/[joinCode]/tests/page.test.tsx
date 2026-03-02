import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizLeaderboardPage from '../page';
import { renderWithProviders } from '@/test/testUtils';
import { useQuery, useSubscription } from '@apollo/client/react';

const mockPush = jest.fn();
const mockUseParams = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useSubscription: jest.fn(),
}));

jest.mock('@/utils/useCountdown', () => ({
  useCountdown: jest.fn(),
}));

import { useCountdown } from '@/utils/useCountdown';

describe('QuizLeaderboardPage', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ joinCode: 'JOIN01' });
    (useSubscription as unknown as jest.Mock).mockReturnValue({ error: undefined });
    (useCountdown as unknown as jest.Mock).mockReturnValue(null);
  });

  it('renders invalid join-code state', () => {
    mockUseParams.mockReturnValue({ joinCode: '' });

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined })
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined });

    renderWithProviders(<QuizLeaderboardPage />);

    expect(screen.getByText('Invalid join code.')).toBeInTheDocument();
  });

  it('renders loading state for quiz', () => {
    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({ loading: true, error: undefined, data: undefined })
      .mockReturnValueOnce({ loading: false, error: undefined, data: undefined });

    renderWithProviders(<QuizLeaderboardPage />);

    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('renders leaderboard rows and navigates back', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: {
          getQuiz: {
            id: 99,
            title: 'Weekly Standings',
          },
        },
      })
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: {
          getLeaderboardForQuiz: [
            {
              userId: 1,
              name: 'Bob',
              score: 8,
              correctCount: 4,
              answeredCount: 5,
              rank: 2,
              updatedAt: '2026-02-20T10:00:00.000Z',
            },
            {
              userId: 2,
              name: 'Alice',
              score: 9,
              correctCount: 5,
              answeredCount: 5,
              rank: 1,
              updatedAt: '2026-02-20T11:00:00.000Z',
            },
          ],
        },
      });

    renderWithProviders(<QuizLeaderboardPage />);

    expect(screen.getByRole('heading', { name: 'Weekly Standings' })).toBeInTheDocument();
    expect(screen.getByText('Realtime status: Connected')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to quizzes' }));

    expect(mockPush).toHaveBeenCalledWith('/quiz/join');
  });

  it('shows countdown when deadline is in the future', () => {
    (useCountdown as unknown as jest.Mock).mockReturnValue('5m 30s');

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: {
          getQuiz: {
            id: 1,
            title: 'Timed Quiz',
            deadline: new Date(Date.now() + 330_000).toISOString(),
          },
        },
      })
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: { getLeaderboardForQuiz: [] },
      });

    renderWithProviders(<QuizLeaderboardPage />);

    expect(screen.getByText('Responses close in: 5m 30s')).toBeInTheDocument();
  });

  it('does not show countdown when deadline has passed', () => {
    (useCountdown as unknown as jest.Mock).mockReturnValue(null);

    (useQuery as unknown as jest.Mock)
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: {
          getQuiz: {
            id: 1,
            title: 'Ended Quiz',
            deadline: new Date(Date.now() - 60_000).toISOString(),
          },
        },
      })
      .mockReturnValueOnce({
        loading: false,
        error: undefined,
        data: { getLeaderboardForQuiz: [] },
      });

    renderWithProviders(<QuizLeaderboardPage />);

    expect(screen.queryByText(/Responses close in:/)).not.toBeInTheDocument();
  });
});
