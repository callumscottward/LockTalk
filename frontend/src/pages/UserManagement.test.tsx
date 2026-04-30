import { render, screen, within, waitFor } from "@testing-library/react";
import UserManagement from "./UserManagement";

const mockUsers = [
  {
    id: 1,
    username: "Alice",
    email: "alice@test.com",
    role: "admin",
    status: "inactive",
    joinedDate: "2024-01-01",
  },
  {
    id: 2,
    username: "Bob",
    email: "bob@test.com",
    role: "viewer",
    status: "inactive",
    joinedDate: "2024-01-02",
  },
];

vi.mock("../services/userService", () => ({
  fetchUsers: () => Promise.resolve(mockUsers),
}));

describe("UserManagement Page", () => {
  beforeEach(() => {
    render(<UserManagement />);
  });

  const getTable = async () => {
    const table = await screen.findByRole("table");
    return within(table);
  };

  test("renders user rows correctly", async () => {
    const table = await getTable();

    expect(table.getByText("Alice")).toBeInTheDocument();
    expect(table.getByText("Bob")).toBeInTheDocument();
    expect(table.getByText("alice@test.com")).toBeInTheDocument();
    expect(table.getByText("bob@test.com")).toBeInTheDocument();
  });

  test("renders role labels correctly", async () => {
    const table = await getTable();

    expect(table.getAllByText("User").length).toBeGreaterThanOrEqual(1);
  });

  test("renders active/inactive badges correctly", async () => {
    const table = await getTable();

    expect(table.getAllByText("Inactive").length).toBeGreaterThan(0);
  });
});
