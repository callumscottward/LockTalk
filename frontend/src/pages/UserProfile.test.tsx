import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import UserProfile from "./UserProfile";

/**
 * @mock fetch
 * @description
 * Mock API response for the UserProfile component.
 * Simulates backend returning authenticated user profile data.
 */
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        username: "testuser",
        email: "test@example.com",
        is_staff: true,
      }),
  })
) as any;


/**
 * @name UserProfile Tests
 * @description
 * Unit tests for the UserProfile page component.
 *
 * These tests verify:
 * Page title rendering
 * User data fetching and display
 * Role-based UI rendering (Admin label)
 * Navigation/back button presence
 */
describe("UserProfile", () => {

  /**
   * @setup
   * @description Clears all mocks before each test to ensure isolation
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @test renders page title
   * @description Ensures the account details heading is displayed
   */
  test("renders page title", () => {
    render(<UserProfile />);
    expect(screen.getByText(/account details/i)).toBeInTheDocument();
  });

  /**
   * @test fetches and displays user data
   * @description Ensures user profile data is fetched and rendered correctly
   */
  test("fetches and displays user data", async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  /**
   * @test shows admin role
   * @description Ensures admin status is correctly displayed when is_staff is true
   */
  test("shows admin role", async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });
  });

  /**
   * @test renders back button
   * @description Ensures navigation back button is present in UI
   */
  test("renders back button", () => {
    render(<UserProfile />);
    expect(screen.getByText("←")).toBeInTheDocument();
  });

});
