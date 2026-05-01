import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import App from './App';

describe('App Routing & Auth', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            username: 'testuser',
            is_staff: true,
          }),
      })
    ) as any;
  });

  test('calls verify-staff on load', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/verify-staff/',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  test('renders login route', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    // Wait for Login component to actually render something
    // (adjust this based on your Login UI)
    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  test('renders signup route', async () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /signup/i })).toBeInTheDocument();
  });
});
