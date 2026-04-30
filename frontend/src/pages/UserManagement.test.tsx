import { render, screen, waitFor, within } from "@testing-library/react";
import UserManagement from "./UserManagement";

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

  test("renders user table (body table only)", async () => {
    render(<UserManagement />);

    const tables = await screen.findAllByRole("table");

    const bodyTable = tables[1]; // index 1 = tbody table

    expect(bodyTable).toBeInTheDocument();
  });

  test("renders user rows correctly", async () => {
    render(<UserManagement />);

    const tables = await screen.findAllByRole("table");
    const bodyTable = tables[1];

    const rows = within(bodyTable).getAllByRole("row");

    expect(rows.length).toBe(2);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("renders role labels correctly", async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByText("viewer")).toBeInTheDocument();
    });
  });

  test("renders active/inactive badges correctly", async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("active")).toBeInTheDocument();
      expect(screen.getByText("inactive")).toBeInTheDocument();
    });
  });

});
