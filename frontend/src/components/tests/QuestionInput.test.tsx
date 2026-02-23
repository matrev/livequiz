import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionInput from '../QuestionInput';
import { QuestionInput as QuestionInputType, QuestionType } from '@/generated/types';
import { renderWithProviders } from '@/test/testUtils';

const baseQuestion: QuestionInputType = {
  text: 'Initial question',
  questionType: QuestionType.MultipleChoice,
  options: ['Option 1', 'Option 2'],
  correctAnswer: 'Option 1',
};

describe('QuestionInput', () => {
  it('renders question fields', () => {
    const onChange = jest.fn();

    renderWithProviders(
      <QuestionInput question={baseQuestion} index={0} onChange={onChange} />,
    );

    expect(screen.getByLabelText('Question Text:')).toHaveValue('Initial question');
    expect(screen.getByLabelText('Multiple Choice')).toBeChecked();
    expect(screen.getByLabelText('Option 1:')).toHaveValue('Option 1');
  });

  it('updates question text', async () => {
    const onChange = jest.fn();

    renderWithProviders(
      <QuestionInput question={baseQuestion} index={0} onChange={onChange} />,
    );

    const input = screen.getByLabelText('Question Text:');
    fireEvent.change(input, { target: { value: 'Updated text' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Updated text' }),
    );
  });

  it('switches to true/false and seeds options', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <QuestionInput question={baseQuestion} index={0} onChange={onChange} />,
    );

    await user.click(screen.getByLabelText('True / False'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        questionType: QuestionType.TrueFalse,
        options: ['True', 'False'],
      }),
    );
  });

  it('adds an option in multiple-choice mode', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <QuestionInput question={baseQuestion} index={0} onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Add Option' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ options: ['Option 1', 'Option 2', ''] }),
    );
  });
});
