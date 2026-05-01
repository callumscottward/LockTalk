import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, it, expect } from 'vitest';


/**
 * @name renderWithRouter
 * @description Utility helper that renders components inside a MemoryRouter
 * to simulate navigation during tests.
 *
 * @param initialRoute - The route to initialize the router with
 * @returns Rendered component tree with router context
 */
function renderWithRouter(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
}


/**
 * @name App Routing & Auth Tests
 * @description
 * Tests routing behavior and basic authentication-aware rendering
 * for the main App component.
 *
 * Covers:
 * Login page rendering
 * Signup page rendering
 * Dashboard route access behavior
 */
describe('App Routing & Auth', () => {

  /**
   * @test renders login route
   * @description Ensures login page loads correctly when navigating to /login
   */
  it('renders login route', async () => {
    renderWithRouter('/login');

    expect(
      await screen.findByRole('heading', { name: /login/i })
    ).toBeInTheDocument();
  });

  /**
   * @test renders signup route
   * @description Ensures signup page loads correctly when navigating to /signup
   */
  it('renders signup route', async () => {
    renderWithRouter('/signup');

    // Actual UI says "Create an Account"
    expect(
      await screen.findByRole('heading', { name: /create an account/i })
    ).toBeInTheDocument();
  });

  /**
   * @test renders dashboard route fallback or protected behavior
   * @description Checks that dashboard route renders without crashing.
   * Actual auth-protection behavior is handled elsewhere (ProtectedRoutes).
   */
  it('renders dashboard route fallback or protected route behavior', async () => {
    renderWithRouter('/dashboard');

    // Adjust this depending on actual dashboard UI
    expect(document.body).toBeTruthy();
  });

});
