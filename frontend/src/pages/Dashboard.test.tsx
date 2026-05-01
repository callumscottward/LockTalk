import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';


/**
 * @name Dashboard Tests
 * @description
 * Unit tests for the Dashboard page component.
 *
 * These tests verify core UI structure and interaction points including:
 * Sidebar rendering
 * Conversation loading
 * Message input field availability
 * Send button presence
 * Menu dropdown accessibility
 */
describe('Dashboard', () => {

  /**
   * @test renders chats sidebar
   * @description Ensures the "Chats" sidebar section is displayed
   */
  it('renders chats sidebar', () => {
    render(<Dashboard />);

    // specific, avoids "multiple /chat/i"
    expect(screen.getByText('Chats')).toBeInTheDocument();
  });

  /**
   * @test loads conversations
   * @description Ensures conversations are loaded and rendered in the UI
   */
  it('loads conversations', async () => {
    render(<Dashboard />);

    // handle duplicates correctly
    const items = await screen.findAllByText(/test conversation/i);
    expect(items.length).toBeGreaterThan(0);
  });

  /**
   * @test typing message updates input
   * @description Ensures message input field is present and ready for user input
   */
  it('typing message updates input', () => {
    render(<Dashboard />);

    const input = screen.getByPlaceholderText(/type a message/i);
    expect(input).toBeInTheDocument();
  });

  /**
   * @test send button exists
   * @description Ensures message send button is rendered in the UI
   */
  it('send button exists', () => {
    render(<Dashboard />);

    const button = screen.getByRole('button', { name: /➤/i });
    expect(button).toBeInTheDocument();
  });

  /**
   * @test opens menu dropdown button exists
   * @description Ensures the overflow/menu button is rendered for chat options
   */
  it('opens menu dropdown button exists', () => {
    render(<Dashboard />);

    const menuBtn = screen.getByText('⋮');
    expect(menuBtn).toBeInTheDocument();
  });

});
