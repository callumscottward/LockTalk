import { render, screen, within, waitFor } from "@testing-library/react";
import UserManagement from "./UserManagement";

const mockUsers = [
  {
    username: "Alice",
    email: "alice@test.com",
    role: "admin",
    status: "active",
    joinedDate: "2024-01-01",
  },
  {
    username: "Bob",
    email: "bob@test.com",
    role: "viewer",
    status: "inactive",
    joinedDate: "2024-02-01",
  },
];

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockUsers),
    })
  ) as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});


const getDataTable = async () => {
  const tables = await screen.findAllByRole("table");
  return tables[1]; // [0] = header, [1] = data table
};

describe("UserManagement Page", () => {
  test("renders user rows correctly", async () => {
    render(<UserManagement />);

    const table = await getDataTable();

    expect(within(table).getByText("Alice")).toBeInTheDocument();
    expect(within(table).getByText("Bob")).toBeInTheDocument();
  });

  test("renders role labels correctly", async () => {
    render(<UserManagement />);

    const table = await getDataTable();

    expect(within(table).getByText("admin")).toBeInTheDocument();
    expect(within(table).getByText("viewer")).toBeInTheDocument();
  });

  test("renders active/inactive badges correctly", async () => {
    render(<UserManagement />);

    const table = await getDataTable();

    expect(within(table).getByText("active")).toBeInTheDocument();
    expect(within(table).getByText("inactive")).toBeInTheDocument();
  });
});
