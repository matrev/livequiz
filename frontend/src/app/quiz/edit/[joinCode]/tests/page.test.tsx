import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditQuizPage from '../page';
import { renderWithProviders } from '@/test/testUtils';
import { useMutation, useQuery } from '@apollo/client/react';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'JOIN01' }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

describe('EditQuizPage', () => {
  beforeEach(() => {
    (useMutation as unknown as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
  });

  it('renders loading state', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: true,
      error: undefined,
      data: undefined,
    });

    renderWithProviders(<EditQuizPage />);

    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('renders quiz and routes to entries/list actions', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        getQuiz: {
          title: 'Weekly Quiz',
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
      },
    });

    renderWithProviders(<EditQuizPage />);

    expect(screen.getByRole('heading', { name: 'Edit Quiz: Weekly Quiz' })).toBeInTheDocument();
    expect(screen.getByText('Capital of Japan?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View Entries' }));
    expect(mockPush).toHaveBeenCalledWith('/quiz/entries/JOIN01');

    await user.click(screen.getByRole('button', { name: 'Back to List' }));
    expect(mockPush).toHaveBeenCalledWith('/quiz/edit');
  });
});
