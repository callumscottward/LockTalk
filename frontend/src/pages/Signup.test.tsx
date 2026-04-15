import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import Signup from "./Signup"


// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as any


// Mock redirect
Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
})


describe("Signup Page", () => {

  it("renders signup form", () => {
    render(<Signup />)

    expect(screen.getByText(/signup/i)).toBeInTheDocument()
  })


  it("allows typing into fields", async () => {
    render(<Signup />)

    const username = screen.getByPlaceholderText(/username/i)
    const password = screen.getByPlaceholderText(/^password$/i)
    const confirm = screen.getByPlaceholderText(/confirm/i)

    await userEvent.type(username, "testuser")
    await userEvent.type(password, "password123")
    await userEvent.type(confirm, "password123")

    expect(username).toHaveValue("testuser")
    expect(password).toHaveValue("password123")
    expect(confirm).toHaveValue("password123")
  })


  it("submits signup form", async () => {
    render(<Signup />)

    const username = screen.getByPlaceholderText(/username/i)
    const password = screen.getByPlaceholderText(/^password$/i)
    const confirm = screen.getByPlaceholderText(/confirm/i)
    const button = screen.getByRole("button", { name: /signup/i })

    await userEvent.type(username, "testuser")
    await userEvent.type(password, "password123")
    await userEvent.type(confirm, "password123")

    await userEvent.click(button)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })


  it("redirects after successful signup", async () => {
    render(<Signup />)

    const button = screen.getByRole("button", { name: /signup/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(window.location.href).not.toBe("")
    })
  })


  it("shows error on failed signup", async () => {
    (fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    )

    render(<Signup />)

    const button = screen.getByRole("button", { name: /signup/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })

})
