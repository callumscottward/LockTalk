import { render, screen, waitFor, within } from "@testing-library/react";
import UserManagement from "./UserManagement";
import { vi } from "vitest";

beforeEach(() => {
  global.fetch = vi.fn(() =>
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UserManagement Page", () => {

  test("renders users in table", async () => {
    render(<UserManagement />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(await screen.findByText("Bob")).toBeInTheDocument();
  });

  test("renders correct roles", async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("User")).toBeInTheDocument();
    });
  });

  test("renders active/inactive badges correctly", async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });
  });

  test("renders both users", async () => {
    render(<UserManagement />);

    const rows = await screen.findAllByRole("row");

    // header row + 2 users
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

});
