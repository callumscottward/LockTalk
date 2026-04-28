import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';

const TestPage = () => <div>Protected Content</div>;

describe('ProtectedRoutes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('shows loading initially', async () => {
    global.fetch = jest.fn(
      () =>
        new Promise(() => {}) // never resolves → stays loading
    ) as jest.Mock;

    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('renders protected content when authenticated', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      })
    ) as jest.Mock;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<TestPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  test('redirects to login when unauthenticated', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<TestPage />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  test('handles fetch error as unauthenticated', async () => {
    global.fetch = jest.fn(() => Promise.reject('Network error')) as jest.Mock;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<TestPage />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
