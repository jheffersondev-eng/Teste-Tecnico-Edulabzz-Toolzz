import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../theme-toggle';

const setThemeMock = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: setThemeMock,
    systemTheme: 'light',
  }),
}));

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    setThemeMock.mockClear();
  });

  it('renders and toggles theme', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'nav.theme.toggle' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'nav.theme.toggle' }));
    expect(setThemeMock).toHaveBeenCalledWith('system');
  });
});
