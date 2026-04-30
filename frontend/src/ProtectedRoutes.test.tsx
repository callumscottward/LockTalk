import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import ProtectedRoutes from './ProtectedRoutes';

const TestPage = () => <div>Protected Content</div>;

describe('ProtectedRoutes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  test('shows loading initially', async () => {
    global.fetch = vi.fn(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoutes />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Loading/i)).toBeInTheDocument();
  });

  test('renders protected content when authenticated', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<TestPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when unauthenticated', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

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

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  test('handles fetch error as unauthenticated', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

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

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });
});
