import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import Login from "./Login"

beforeEach(() => {
  vi.resetAllMocks()

  Object.defineProperty(window, "location", {
    value: { href: "" },
    writable: true,
  })
})

describe("Login Page", () => {

  it("renders login form", () => {
    render(<Login />)

    expect(screen.getByText(/login/i)).toBeInTheDocument()
  })

  it("allows typing email and password", async () => {
    render(<Login />)

    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)

    await userEvent.type(email, "test@test.com")
    await userEvent.type(password, "password123")

    expect(email).toHaveValue("test@test.com")
    expect(password).toHaveValue("password123")
  })

  it("submits login form", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, message: "ok" }),
      })
    ) as any

    render(<Login />)

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com")
    await userEvent.type(screen.getByLabelText(/password/i), "pass")

    await userEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })

  it("redirects after successful login", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, message: "ok" }),
      })
    ) as any

    render(<Login />)

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com")
    await userEvent.type(screen.getByLabelText(/password/i), "pass")

    await userEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard")
    })
  })

  it("shows error on failed login", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false, message: "Invalid" }),
      })
    ) as any

    render(<Login />)

    await userEvent.type(screen.getByLabelText(/email/i), "wrong@test.com")
    await userEvent.type(screen.getByLabelText(/password/i), "badpass")

    await userEvent.click(screen.getByRole("button", { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument()
    })
  })
})
