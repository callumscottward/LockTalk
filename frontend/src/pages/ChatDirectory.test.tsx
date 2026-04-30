import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ChatDirectory from "./ChatDirectory";

// roper WebSocket mock
class MockWebSocket {
  url: string;
  constructor(url: string) {
    this.url = url;
  }
  send = vi.fn();
  close = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}
global.WebSocket = MockWebSocket as any;

// Mock fetch with correct shape
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        {
          id: 1,
          name: "Test Chat",
          participants: [{ username: "Alice" }],
          last_message_time: new Date().toISOString(),
        },
      ]),
  })
) as any;

describe("ChatDirectory", () => {

  it("renders page title", () => {
    render(<ChatDirectory />);

    expect(
      screen.getByRole("heading", { name: /chat directory/i })
    ).toBeInTheDocument();
  });

  it("renders chat rows after fetch", async () => {
    render(<ChatDirectory />);

    expect(
      await screen.findByText(/test chat/i)
    ).toBeInTheDocument();
  });

});
