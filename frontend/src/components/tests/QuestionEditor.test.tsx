import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionEditor from '../QuestionEditor';
import { QuestionInput, QuestionType } from '@/generated/types';
import { renderWithProviders } from '@/test/testUtils';

const baseQuestion: QuestionInput = {
  text: 'What is 2 + 2?',
  questionType: QuestionType.MultipleChoice,
  options: ['3', '4', '5'],
  correctAnswer: '4',
};

describe('QuestionEditor', () => {
  it('renders editor fields', () => {
    renderWithProviders(
      <QuestionEditor question={baseQuestion} index={0} onChange={jest.fn()} />,
    );

    expect(screen.getByLabelText('Question Text:')).toHaveValue('What is 2 + 2?');
    expect(screen.getByLabelText('Question Type:')).toHaveValue(QuestionType.MultipleChoice);
    expect(screen.getByLabelText('Correct Answer:')).toHaveValue('4');
  });

  it('switches to short answer and drops options', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <QuestionEditor question={baseQuestion} index={0} onChange={onChange} />,
    );

    await user.selectOptions(screen.getByLabelText('Question Type:'), QuestionType.ShortAnswer);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ questionType: QuestionType.ShortAnswer, options: null }),
    );
  });

  it('removes an option when more than two options exist', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <QuestionEditor question={baseQuestion} index={0} onChange={onChange} />,
    );

    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ options: ['4', '5'] }),
    );
  });
});
