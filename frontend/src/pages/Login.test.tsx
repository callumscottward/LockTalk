import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import { vi } from "vitest";

// mock fetch
global.fetch = vi.fn();

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form", () => {
    render(<Login />);

    expect(
      screen.getByRole("heading", { name: /login/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  it("allows typing email and password", async () => {
    render(<Login />);

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);

    await userEvent.type(email, "test@test.com");
    await userEvent.type(password, "password");

    expect(email).toHaveValue("test@test.com");
    expect(password).toHaveValue("password");
  });

  it("submits login form", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "123" }),
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "pass");

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(fetch).toHaveBeenCalled();
  });

  it("redirects after successful login", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "123" }),
    });

    // mock navigation
    const mockNavigate = vi.fn();
    vi.mock("react-router-dom", async () => {
      const actual = await vi.importActual<any>("react-router-dom");
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "pass");

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(mockNavigate).toHaveBeenCalled();
  });

  it("shows error on failed login", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "wrong@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "badpass");

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    // adjust this depending on your UI
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
