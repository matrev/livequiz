import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JoinQuizPage from '../page';
import { renderWithProviders } from '@/test/testUtils';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { createUser, upsertEntry } from '@/graphql/mutations';

const mockPush = jest.fn();
const mockUpsertEntry = jest.fn();
const mockCreateUser = jest.fn();
const mockGetUserByEmail = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: () => ({ joinCode: 'JOIN01' }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useLazyQuery: jest.fn(),
}));

const mockQuizData = {
  getQuiz: {
    id: 10,
    title: 'Pop Quiz',
    questions: [
      {
        id: 1,
        text: 'Type this answer',
        questionType: 'SHORT_ANSWER',
        options: null,
      },
    ],
  },
};

describe('JoinQuizPage', () => {
  beforeEach(() => {
    (useMutation as unknown as jest.Mock).mockImplementation((mutation) => {
      if (mutation === upsertEntry) {
        return [mockUpsertEntry, { loading: false }];
      }

      if (mutation === createUser) {
        return [mockCreateUser, { loading: false }];
      }

      return [jest.fn(), { loading: false }];
    });

    (useLazyQuery as unknown as jest.Mock).mockReturnValue([
      mockGetUserByEmail,
      { loading: false, data: undefined, error: undefined },
    ]);
  });

  it('renders loading state', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: true,
      error: undefined,
      data: undefined,
    });

    renderWithProviders(<JoinQuizPage />);

    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('submits answers and shows thank-you state', async () => {
    const user = userEvent.setup();

    mockUpsertEntry.mockResolvedValueOnce({ data: { upsertEntry: { id: 1 } } });

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
    });

    renderWithProviders(<JoinQuizPage />);

    await user.type(screen.getByPlaceholderText('Enter your username'), 'Alice');
    await user.type(screen.getByPlaceholderText('Enter your answer'), 'Blue');
    await user.click(screen.getByRole('button', { name: 'Submit Quiz' }));

    await waitFor(() => {
      expect(mockUpsertEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            quizId: 10,
            name: 'Alice',
            answers: { '1': 'Blue' },
          }),
        }),
      );
    });

    expect(screen.getByText('Thank you for completing the quiz!')).toBeInTheDocument();
  });

  it('routes back to join list when cancel is clicked', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: mockQuizData,
    });

    renderWithProviders(<JoinQuizPage />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockPush).toHaveBeenCalledWith('/quiz/join');
  });
});
