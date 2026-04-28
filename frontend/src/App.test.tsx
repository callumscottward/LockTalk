import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Routing & Auth', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            username: 'testuser',
            is_staff: true,
          }),
      })
    ) as jest.Mock;
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
        expect.any(Object)
      );
    });
  });

  test('renders login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test('renders signup route', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/signup/i)).toBeInTheDocument();
  });
});
