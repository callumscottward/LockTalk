import { vi } from 'vitest';

// Proper WebSocket mock
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url: string) {
    this.url = url;
    this.readyState = MockWebSocket.OPEN;

    // simulate async open
    setTimeout(() => {
      this.onopen?.(new Event('open'));
    }, 0);
  }

  url: string;
  readyState: number;

  send = vi.fn();
  close = vi.fn();

  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: Event) => void) | null = null;
}

// attach globally
global.WebSocket = MockWebSocket as any;
