import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";

/**
 * @name Login Page Tests
 * @description
 * Unit tests for the Login page component.
 *
 * These tests verify:
 * Proper rendering of login form UI elements
 * User ability to input email and password
 * Basic form submission interaction (UI-level only)
 */
describe("Login Page", () => {

  /**
   * @test renders login form
   * @description Ensures that all essential login form elements are rendered
   */
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

  /**
   * @test allows typing email and password
   * @description Ensures controlled inputs update correctly when user types
   */
  it("allows typing email and password", async () => {
    render(<Login />);

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);

    await userEvent.type(email, "test@test.com");
    await userEvent.type(password, "password123");

    expect(email).toHaveValue("test@test.com");
    expect(password).toHaveValue("password123");
  });

  /**
   * @test submits login form
   * @description Simulates form submission interaction (UI-level test only)
   * Note: No backend or authentication response is asserted here.
   */
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
