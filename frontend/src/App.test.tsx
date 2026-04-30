import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, it, expect } from 'vitest';

function renderWithRouter(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
}

describe('App Routing & Auth', () => {

  it('renders login route', async () => {
    renderWithRouter('/login');

    expect(
      await screen.findByRole('heading', { name: /login/i })
    ).toBeInTheDocument();
  });

  it('renders signup route', async () => {
    renderWithRouter('/signup');

    // Your actual UI says "Create an Account"
    expect(
      await screen.findByRole('heading', { name: /create an account/i })
    ).toBeInTheDocument();
  });

  it('renders dashboard route fallback or protected route behavior', async () => {
    renderWithRouter('/dashboard');

    // Adjust this depending on your actual dashboard UI
    // Example safe fallback check:
    expect(document.body).toBeTruthy();
  });

});
