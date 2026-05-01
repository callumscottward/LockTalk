import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import ProtectedRoutes from './ProtectedRoutes';


/**
 * @name TestPage
 * @description Simple placeholder component used to simulate protected content rendering
 */
const TestPage = () => <div>Protected Content</div>;


/**
 * @name ProtectedRoutes Tests
 * @description
 * Unit tests for route protection logic in the ProtectedRoutes component.
 *
 * These tests verify:
 * Loading state display during authentication check
 * Successful rendering of protected content when authenticated
 * Redirection to login when unauthenticated
 * Handling of network or fetch errors as unauthenticated states
 */
describe('ProtectedRoutes', () => {

  /**
   * @setup
   * @description Resets mocks and initializes fetch before each test
   */
  beforeEach(() => {
    vi.resetAllMocks();
    globalThis.fetch = vi.fn();
  });

  /**
   * @test shows loading initially
   * @description Ensures loading state is displayed while authentication request is pending
   */
  test('shows loading initially', async () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoutes />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Loading/i)).toBeInTheDocument();
  });

  /**
   * @test renders protected content when authenticated
   * @description Ensures authenticated users can access protected routes
   */
  test('renders protected content when authenticated', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
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

  /**
   * @test redirects to login when unauthenticated
   * @description Ensures unauthenticated users are redirected to login page
   */
  test('redirects to login when unauthenticated', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
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

  /**
   * @test handles fetch error as unauthenticated
   * @description Ensures network errors are treated as failed authentication attempts
   */
  test('handles fetch error as unauthenticated', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

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
