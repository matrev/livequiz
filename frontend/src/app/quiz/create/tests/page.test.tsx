import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateQuizPage from '../page';
import { renderWithProviders } from '@/test/testUtils';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { createQuiz, createUser } from '@/graphql/mutations';

const mockCreateQuiz = jest.fn();
const mockCreateUser = jest.fn();
const mockGetUserByEmail = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(),
  useLazyQuery: jest.fn(),
}));

const setupApolloMocks = () => {
  (useMutation as unknown as jest.Mock).mockImplementation((mutation) => {
    if (mutation === createQuiz) {
      return [mockCreateQuiz, { data: undefined, loading: false }];
    }

    if (mutation === createUser) {
      return [mockCreateUser, { data: undefined, loading: false }];
    }

    return [jest.fn(), { data: undefined, loading: false }];
  });

  (useLazyQuery as unknown as jest.Mock).mockReturnValue([
    mockGetUserByEmail,
    { loading: false, data: undefined, error: undefined },
  ]);
};

describe('CreateQuizPage', () => {
  beforeEach(() => {
    setupApolloMocks();
  });

  it('renders create quiz form controls', () => {
    renderWithProviders(<CreateQuizPage />);

    expect(screen.getByRole('heading', { name: 'Create New Quiz' })).toBeInTheDocument();
    expect(screen.getByLabelText('Quiz Title:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Question' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Quiz' })).toBeInTheDocument();
  });

  it('adds and removes a question card', async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<CreateQuizPage />);

    await user.click(screen.getByRole('button', { name: 'Add Question' }));
    expect(screen.getByText('Question 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByText('Question 1')).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('shows validation error when submitting without questions', async () => {
    const user = userEvent.setup();

    renderWithProviders(<CreateQuizPage />);

    await user.type(screen.getByLabelText('Quiz Title:'), 'Trivia Night');
    await user.type(screen.getByLabelText('Your Name:'), 'Host');
    await user.type(screen.getByLabelText('Your Email:'), 'host@example.com');
    await user.click(screen.getByRole('button', { name: 'Create Quiz' }));

    await waitFor(() => {
      expect(screen.getByText('A quiz must have atleast one question.')).toBeInTheDocument();
    });
  });
});
