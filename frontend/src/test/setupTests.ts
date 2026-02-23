import '@testing-library/jest-dom';
import React, { ReactNode } from 'react';

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('next/link', () => {
  const Link = ({ href, children, ...props }: { href: string; children: ReactNode }) =>
    React.createElement('a', { href, ...props }, children);

  Link.displayName = 'MockNextLink';
  return Link;
});
