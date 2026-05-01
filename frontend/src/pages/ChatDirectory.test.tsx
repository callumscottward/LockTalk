import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ChatDirectory from "./ChatDirectory";


/**
 * @name MockWebSocket
 * @description
 * Mock implementation of WebSocket used for unit testing ChatDirectory
 * without establishing real network connections.
 */
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


/**
 * @mock fetch
 * @description
 * Mock API response for chat directory data.
 * Simulates backend returning a list of conversations.
 */
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


/**
 * @name ChatDirectory Tests
 * @description
 * Unit tests for the ChatDirectory page component.
 *
 * These tests verify:
 * Page title renders correctly
 * Chat data is fetched and displayed properly
 * UI updates after asynchronous data load
 */
describe("ChatDirectory", () => {

  /**
   * @test renders page title
   * @description Ensures the Chat Directory heading is displayed on render
   */
  it("renders page title", () => {
    render(<ChatDirectory />);

    expect(
      screen.getByRole("heading", { name: /chat directory/i })
    ).toBeInTheDocument();
  });

  /**
   * @test renders chat rows after fetch
   * @description Ensures chat data is loaded and displayed after API call
   */
  it("renders chat rows after fetch", async () => {
    render(<ChatDirectory />);

    expect(
      await screen.findByText(/test chat/i)
    ).toBeInTheDocument();
  });

});
