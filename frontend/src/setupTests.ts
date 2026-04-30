import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          id: 1,
          name: 'Test Conversation',
          participants: [{ username: 'Alice' }],
        },
      ]),
  })
) as any;

// Proper WebSocket mock (must be a CLASS)
class MockWebSocket {
  url: string;
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;

  constructor(url: string) {
    this.url = url;

    // simulate connection opening
    setTimeout(() => {
      this.onopen?.({});
    }, 0);
  }

  send = vi.fn();
  close = vi.fn();

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

global.WebSocket = MockWebSocket as any;
