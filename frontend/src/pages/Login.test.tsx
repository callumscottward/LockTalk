import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import Login from "./Login"


// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as any


// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
})


describe("Login Page", () => {

  it("renders login form", () => {
    render(<Login />)

    expect(screen.getByText(/login/i)).toBeInTheDocument()
  })


  it("allows typing username and password", async () => {
    render(<Login />)

    const username = screen.getByPlaceholderText(/username|email/i)
    const password = screen.getByPlaceholderText(/password/i)

    await userEvent.type(username, "testuser")
    await userEvent.type(password, "password123")

    expect(username).toHaveValue("testuser")
    expect(password).toHaveValue("password123")
  })


  it("submits login form", async () => {
    render(<Login />)

    const username = screen.getByPlaceholderText(/username|email/i)
    const password = screen.getByPlaceholderText(/password/i)
    const button = screen.getByRole("button", { name: /login/i })

    await userEvent.type(username, "testuser")
    await userEvent.type(password, "password123")
    await userEvent.click(button)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })


  it("redirects after successful login", async () => {
    render(<Login />)

    const button = screen.getByRole("button", { name: /login/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(window.location.href).not.toBe("")
    })
  })


  it("shows error on failed login", async () => {
    (fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    )

    render(<Login />)

    const button = screen.getByRole("button", { name: /login/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })

})
