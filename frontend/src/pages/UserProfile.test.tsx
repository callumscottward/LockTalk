import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            username: 'testuser',
            email: 'test@example.com',
            is_staff: true,
          }),
      })
    ) as jest.Mock;
  });

  test('renders page title', () => {
    render(<UserProfile />);
    expect(screen.getByText(/Account Details/i)).toBeInTheDocument();
  });

  test('fetches and displays user data', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  test('shows Admin role for staff user', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  test('back button exists', () => {
    render(<UserProfile />);
    expect(screen.getByText(/←/)).toBeInTheDocument();
  });
});
