import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DarkmodeOption } from './DarkmodeOption';

describe('DarkmodeOption', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(
      'pf-v6-theme-dark',
      'pf-v6-theme-light',
    );
  });

  it('should render the correct initial theme based on localStorage', () => {
    localStorage.setItem('theme-preference', 'dark');
    const { getByText } = render(<DarkmodeOption />);

    expect(getByText('Switch to light mode')).toBeInTheDocument();
  });

  it('should render the correct initial theme based on system preference', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: query === '(prefers-color-scheme: dark)',
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    });

    const { getByText } = render(<DarkmodeOption />);

    expect(getByText('Switch to light mode')).toBeInTheDocument();
  });

  it('should toggle the theme and update localStorage', () => {
    const { getByText } = render(<DarkmodeOption />);
    const button = getByText('Switch to light mode');

    fireEvent.click(button);
    expect(localStorage.getItem('theme-preference')).toBe('light');
    expect(
      document.documentElement.classList.contains('pf-v6-theme-light'),
    ).toBe(true);
    expect(getByText('Switch to dark mode')).toBeInTheDocument();
  });

  it('should toggle the theme back to light', () => {
    localStorage.setItem('theme-preference', 'dark');
    const { getByText } = render(<DarkmodeOption />);
    const button = getByText('Switch to light mode');

    fireEvent.click(button);
    expect(localStorage.getItem('theme-preference')).toBe('light');
    expect(
      document.documentElement.classList.contains('pf-v6-theme-light'),
    ).toBe(true);
    expect(getByText('Switch to dark mode')).toBeInTheDocument();
  });
});
