import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatDirectory from './ChatDirectory';

// -----------------------------
// WebSocket MOCK (IMPORTANT)
// -----------------------------
class MockWebSocket {
  constructor() {
    this.readyState = 1;
    setTimeout(() => {
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send = vi.fn();
  close = vi.fn();

  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  readyState: number;
}

global.WebSocket = MockWebSocket as any;

// -----------------------------
// FETCH MOCK
// -----------------------------
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          {
            id: 1,
            name: 'Test Chat',
            last_message: 'Hello',
          },
        ]),
    })
  ) as any;
});

// -----------------------------
// TESTS
// -----------------------------
describe('ChatDirectory', () => {

  it('renders page title', () => {
    render(<ChatDirectory />);
    expect(screen.getByText(/chat/i)).toBeInTheDocument();
  });

  it('renders chat rows after fetch', async () => {
    render(<ChatDirectory />);
    expect(await screen.findByText(/test chat/i)).toBeInTheDocument();
  });

});
