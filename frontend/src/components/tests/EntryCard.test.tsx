import { screen } from '@testing-library/react';
import EntryCard from '../EntryCard';
import { renderWithProviders } from '@/test/testUtils';

const entry = {
  id: 5,
  title: 'Quiz response #1',
  quizId: 10,
  authorId: 3,
  answers: { '1': 'Paris', '2': 'True' },
  updatedAt: '2026-02-20T10:00:00.000Z',
};

describe('EntryCard', () => {
  it('renders light variant details and destination link', () => {
    renderWithProviders(<EntryCard entry={entry} />);

    expect(screen.getByRole('heading', { name: 'Quiz response #1' })).toBeInTheDocument();
    expect(screen.getByText('Participant #3 · 2 answers')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/quiz/responses/10');
  });

  it('renders dark variant details and edit action', () => {
    renderWithProviders(<EntryCard entry={entry} variant="dark" />);

    expect(screen.getByText('Quiz response #1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/quiz/responses/10');
  });

  it('renders zero answers when answers are missing', () => {
    renderWithProviders(
      <EntryCard
        entry={{
          ...entry,
          answers: null,
        }}
      />,
    );

    expect(screen.getByText('Participant #3 · 0 answers')).toBeInTheDocument();
  });
});
