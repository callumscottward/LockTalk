import { render, screen, within } from "@testing-library/react";
import UserManagement from "./UserManagement";
import { vi } from "vitest";

/**
 * @mock fetch
 * @description
 * Mock API response for user management data.
 * Simulates backend returning a list of users for admin dashboard display.
 */
beforeEach(() => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          {
            id: 1,
            username: "Alice",
            email: "alice@test.com",
            is_staff: true,
            is_active: true,
            date_joined: "2024-01-01T00:00:00Z",
          },
          {
            id: 2,
            username: "Bob",
            email: "bob@test.com",
            is_staff: false,
            is_active: false,
            date_joined: "2024-01-02T00:00:00Z",
          },
        ]),
    } as any)
  );
});

/**
 * @cleanup
 * @description Restores mocked fetch after each test to prevent test leakage
 */
afterEach(() => {
  vi.restoreAllMocks();
});


/**
 * @name UserManagement Tests
 * @description
 * Unit tests for the UserManagement admin page component.
 *
 * These tests verify:
 * User table renders correctly
 * User data is displayed properly in rows
 * Role labels (Admin/User) are computed and rendered correctly
 * Active/Inactive status badges are displayed correctly
 */
describe("UserManagement Page", () => {

  /**
   * @test renders user table
   * @description Ensures that the user management table is rendered on page load
   */
  test("renders user table", async () => {
    render(<UserManagement />);

    const tables = await screen.findAllByRole("table");

    expect(tables[1]).toBeInTheDocument();
  });

  /**
   * @test renders user rows correctly
   * @description Ensures user data is correctly rendered into table rows
   */
  test("renders user rows correctly", async () => {
    render(<UserManagement />);

    const tables = await screen.findAllByRole("table");
    const bodyTable = tables[1];

    const rows = within(bodyTable).getAllByRole("row");

    expect(rows.length).toBe(2);

    expect(within(bodyTable).getByText("Alice")).toBeInTheDocument();
    expect(within(bodyTable).getByText("Bob")).toBeInTheDocument();
  });

  /**
   * @test renders role labels correctly
   * @description Ensures user roles (Admin/User) are correctly derived from is_staff field
   */
  test("renders role labels correctly", async () => {
    render(<UserManagement />);

    const tables = await screen.findAllByRole("table");
    const bodyTable = tables[1];

    expect(within(bodyTable).getByText("Admin")).toBeInTheDocument();
    expect(within(bodyTable).getByText("User")).toBeInTheDocument();
  });

  /**
   * @test renders active/inactive badges correctly
   * @description Ensures user active state is correctly displayed in UI badges
   */
  test("renders active/inactive badges correctly", async () => {
    render(<UserManagement />);

    const tables = await screen.findAllByRole("table");
    const bodyTable = tables[1];

    expect(within(bodyTable).getByText("Active")).toBeInTheDocument();
    expect(within(bodyTable).getByText("Inactive")).toBeInTheDocument();
  });

});
