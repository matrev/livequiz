import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JoinPage from '../page';
import { renderWithProviders } from '@/test/testUtils';
import { useLazyQuery } from '@apollo/client/react';

const mockPush = jest.fn();
const mockFetchQuiz = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@apollo/client/react', () => ({
  useLazyQuery: jest.fn(),
}));

describe('JoinPage', () => {
  beforeEach(() => {
    (useLazyQuery as unknown as jest.Mock).mockReturnValue([
      mockFetchQuiz,
      { loading: false, data: undefined, error: undefined },
    ]);
  });

  it('shows validation error when join code is blank', async () => {
    const user = userEvent.setup();

    renderWithProviders(<JoinPage />);

    await user.click(screen.getByRole('button', { name: 'Join Quiz' }));

    expect(screen.getByText('Please enter a join code.')).toBeInTheDocument();
    expect(mockFetchQuiz).not.toHaveBeenCalled();
  });

  it('routes to join page for an active quiz', async () => {
    const user = userEvent.setup();
    mockFetchQuiz.mockResolvedValueOnce({
      data: {
        getQuiz: {
          joinCode: 'ABC123',
          deadline: null,
        },
      },
    });

    renderWithProviders(<JoinPage />);

    await user.type(screen.getByLabelText('Join Code'), 'ABC123');
    await user.click(screen.getByRole('button', { name: 'Join Quiz' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/quiz/join/ABC123');
    });
  });

  it('routes to leaderboard if deadline is in the past', async () => {
    const user = userEvent.setup();
    mockFetchQuiz.mockResolvedValueOnce({
      data: {
        getQuiz: {
          joinCode: 'ABC123',
          deadline: '2020-01-01T00:00:00.000Z',
        },
      },
    });

    renderWithProviders(<JoinPage />);

    await user.type(screen.getByLabelText('Join Code'), 'ABC123');
    await user.click(screen.getByRole('button', { name: 'Join Quiz' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/quiz/leaderboard/ABC123');
    });
  });
});
