import "@testing-library/jest-dom";
import { vi } from "vitest";

/* Proper WebSocket mock */
class MockWebSocket {
  url: string;
  readyState = 1;

  constructor(url: string) {
    this.url = url;
  }

  send = vi.fn();
  close = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

global.WebSocket = MockWebSocket as any;

/* Default fetch mock (safe fallback) */
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as any;
