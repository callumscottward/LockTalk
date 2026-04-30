import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "./Signup";

describe("Signup Page", () => {
  test("renders signup form", () => {
    render(<Signup />);

    expect(screen.getByText(/create an account/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("allows typing into all fields", async () => {
    const user = userEvent.setup();
    render(<Signup />);

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/password/i), "pass123");
    await user.type(screen.getByLabelText(/confirm password/i), "pass123");

    expect(screen.getByLabelText(/email/i)).toHaveValue("test@test.com");
    expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Doe");
  });

  test("submits signup form successfully", async () => {
    const user = userEvent.setup();
    render(<Signup />);

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/password/i), "pass123");
    await user.type(screen.getByLabelText(/confirm password/i), "pass123");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // adjust based on your success behavior
    await waitFor(() => {
      expect(
        screen.queryByText(/signup failed/i)
      ).not.toBeInTheDocument();
    });
  });

  test("shows error on failed signup", async () => {
    const user = userEvent.setup();
    render(<Signup />);

    await user.type(screen.getByLabelText(/email/i), "bad@test.com");
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.type(screen.getByLabelText(/confirm password/i), "wrong");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/signup failed/i)
      ).toBeInTheDocument();
    });
  });
});
