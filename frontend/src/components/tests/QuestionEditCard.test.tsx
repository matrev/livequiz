import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionEditCard from '../QuestionEditCard';
import { QuestionInput, QuestionType } from '@/generated/types';
import { renderWithProviders } from '@/test/testUtils';

const question = {
  id: 11,
  text: 'Capital of France?',
  questionType: QuestionType.MultipleChoice,
  options: ['Paris', 'Berlin'],
  correctAnswer: 'Paris',
};

const draft: QuestionInput = {
  text: 'Capital of France?',
  questionType: QuestionType.MultipleChoice,
  options: ['Paris', 'Berlin'],
  correctAnswer: 'Paris',
};

describe('QuestionEditCard', () => {
  it('renders read-only question information', () => {
    renderWithProviders(
      <QuestionEditCard
        question={question}
        index={0}
        isEditing={false}
        isSaving={false}
        questionDraft={draft}
        questionErrorMessage=""
        questionSuccessMessage=""
        onSave={jest.fn()}
        onToggleEdit={jest.fn()}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Capital of France?')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getAllByText('Paris')).toHaveLength(2);
  });

  it('calls toggle when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleEdit = jest.fn();

    renderWithProviders(
      <QuestionEditCard
        question={question}
        index={0}
        isEditing={false}
        isSaving={false}
        questionDraft={draft}
        questionErrorMessage=""
        questionSuccessMessage=""
        onSave={jest.fn()}
        onToggleEdit={onToggleEdit}
        onChange={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onToggleEdit).toHaveBeenCalledWith(11);
  });

  it('renders editing actions and status messages', () => {
    renderWithProviders(
      <QuestionEditCard
        question={question}
        index={0}
        isEditing
        isSaving
        questionDraft={draft}
        questionErrorMessage="Question failed"
        questionSuccessMessage="Question saved"
        onSave={jest.fn()}
        onToggleEdit={jest.fn()}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Question failed');
    expect(screen.getByRole('status')).toHaveTextContent('Question saved');
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
