import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';

type WrapperProps = {
  children: ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
  return <>{children}</>;
};

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return render(ui, { wrapper: Wrapper, ...options });
};
