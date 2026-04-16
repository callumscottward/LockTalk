import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Messages from "./Dashboard"
import { vi } from "vitest"


// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          id: "1",
          name: "Test Chat",
          is_group: false,
          participants: [],
          time: new Date().toISOString(),
        },
      ]),
  })
) as any


// Mock WebSocket
class MockWebSocket {
  onmessage: ((event: MessageEvent) => void) | null = null
  send = vi.fn()
  close = vi.fn()
}

global.WebSocket = vi.fn(() => new MockWebSocket()) as any


describe("Dashboard", () => {

  it("renders Chats sidebar", async () => {
    render(<Messages />)

    expect(await screen.findByText("Chats")).toBeInTheDocument()
  })


  it("loads conversations", async () => {
    render(<Messages />)

    expect(await screen.findByText("Test Chat")).toBeInTheDocument()
  })


  it("opens new chat modal", async () => {
    render(<Messages />)

    const button = await screen.findByText("+")
    await userEvent.click(button)

    expect(screen.getByText("New Chat")).toBeInTheDocument()
  })


  it("typing message updates input", async () => {
    render(<Messages />)

    const input = await screen.findByPlaceholderText("Type a message...")

    await userEvent.type(input, "Hello")

    expect(input).toHaveValue("Hello")
  })


  it("send button clears input", async () => {
    render(<Messages />)

    const input = await screen.findByPlaceholderText("Type a message...")
    const button = await screen.findByText("➤")

    await userEvent.type(input, "Hello")
    await userEvent.click(button)

    await waitFor(() => {
      expect(input).toHaveValue("")
    })
  })


  it("opens menu dropdown", async () => {
    render(<Messages />)

    const menu = await screen.findByText("⋮")
    await userEvent.click(menu)

    expect(screen.getByText("User Profile")).toBeInTheDocument()
  })

})
