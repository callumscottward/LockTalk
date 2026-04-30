import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ChatDirectory from "./ChatDirectory";

// ✅ Mock WebSocket properly (THIS fixes your earlier crash)
global.WebSocket = vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// ✅ Mock fetch with correct structure
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

    // ✅ more specific (fixes duplicate error)
    expect(screen.getByRole("heading", { name: /chat directory/i }))
      .toBeInTheDocument();
  });

  it("renders chat rows after fetch", async () => {
    render(<ChatDirectory />);

    // ✅ waits for async data
    expect(await screen.findByText(/test chat/i))
      .toBeInTheDocument();
  });

});
