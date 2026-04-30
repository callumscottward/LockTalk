import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import Signup from "./Signup"

beforeEach(() => {
  vi.resetAllMocks()

  Object.defineProperty(window, "location", {
    value: { href: "" },
    writable: true,
  })
})

describe("Signup Page", () => {

  it("renders signup page", () => {
    render(<Signup />)

    expect(screen.getByText(/create an account/i)).toBeInTheDocument()
  })

  it("allows typing into all fields", async () => {
    render(<Signup />)

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com")
    await userEvent.type(screen.getByLabelText(/first name/i), "John")
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe")
    await userEvent.type(screen.getByLabelText(/^password:/i), "pass123")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "pass123")

    expect(screen.getByLabelText(/email/i)).toHaveValue("test@test.com")
    expect(screen.getByLabelText(/first name/i)).toHaveValue("John")
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Doe")
    expect(screen.getByLabelText(/^password:/i)).toHaveValue("pass123")
    expect(screen.getByLabelText(/confirm password/i)).toHaveValue("pass123")
  })

  it("submits signup form", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as any

    render(<Signup />)

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com")
    await userEvent.type(screen.getByLabelText(/first name/i), "John")
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe")
    await userEvent.type(screen.getByLabelText(/^password:/i), "pass123")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "pass123")

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })

  it("redirects after successful signup", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as any

    render(<Signup />)

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com")
    await userEvent.type(screen.getByLabelText(/first name/i), "John")
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe")
    await userEvent.type(screen.getByLabelText(/^password:/i), "pass123")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "pass123")

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }))

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard")
    })
  })

  it("shows error on failed signup", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          message: "Signup failed",
          errors: { email: ["invalid"] }
        }),
      })
    ) as any

    render(<Signup />)

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/signup failed/i)).toBeInTheDocument()
    })
  })
})
