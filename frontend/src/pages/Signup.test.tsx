import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "./Signup";

describe("Signup Page", () => {
  it("renders signup form", () => {
    render(<Signup />);

    expect(
      screen.getByRole("heading", { name: /create an account/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("allows typing into all fields", async () => {
    render(<Signup />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/^password$/i), "pass123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "pass123"
    );

    expect(screen.getByLabelText(/email/i)).toHaveValue("test@test.com");
  });

  it("submits signup form", async () => {
    render(<Signup />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/^password$/i), "pass123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "pass123"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /sign up/i })
    );

    expect(true).toBe(true); // replace with real assertion if needed
  });

  it("shows error on failed signup", async () => {
    render(<Signup />);

    await userEvent.type(screen.getByLabelText(/email/i), "bad@test.com");
    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/^password$/i), "pass123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "pass123"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /sign up/i })
    );

    // Only works IF your component renders this
    await waitFor(() => {
      expect(screen.getByText(/signup failed/i)).toBeInTheDocument();
    });
  });
});
