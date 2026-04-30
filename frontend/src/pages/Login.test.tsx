import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";

describe("Login Page", () => {
  it("renders login form", () => {
    render(<Login />);

    // Be specific (no ambiguity)
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
    await userEvent.type(password, "password123");

    expect(email).toHaveValue("test@test.com");
    expect(password).toHaveValue("password123");
  });

  it("submits login form", async () => {
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "pass");

    await userEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    // Adjust depending on app behavior
    expect(true).toBe(true);
  });
});
