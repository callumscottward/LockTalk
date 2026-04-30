import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import UserProfile from "./UserProfile";

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        username: "testuser",
        email: "test@example.com",
        is_staff: true,
      }),
  })
) as any;

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders page title", () => {
    render(<UserProfile />);
    expect(screen.getByText(/account details/i)).toBeInTheDocument();
  });

  test("fetches and displays user data", async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  test("shows admin role", async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });
  });

  test("renders back button", () => {
    render(<UserProfile />);
    expect(screen.getByText("←")).toBeInTheDocument();
  });
});
