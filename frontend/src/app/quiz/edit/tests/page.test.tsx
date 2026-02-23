import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditQuizListPage from '../page';
import { renderWithProviders } from '@/test/testUtils';
import { useQuery } from '@apollo/client/react';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

describe('EditQuizListPage', () => {
  it('renders loading state', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: true,
      error: undefined,
      data: undefined,
    });

    renderWithProviders(<EditQuizListPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: { message: 'Request failed' },
      data: undefined,
    });

    renderWithProviders(<EditQuizListPage />);

    expect(screen.getByText('Error: Request failed')).toBeInTheDocument();
  });

  it('routes to selected quiz edit page on click', async () => {
    const user = userEvent.setup();

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        getAllQuizzes: [
          { id: 1, title: 'Math Quiz', joinCode: 'MATH01' },
          { id: 2, title: 'Science Quiz', joinCode: 'SCI02' },
        ],
      },
    });

    renderWithProviders(<EditQuizListPage />);

    await user.click(screen.getByText('Math Quiz'));

    expect(mockPush).toHaveBeenCalledWith('/quiz/edit/MATH01');
  });
});
