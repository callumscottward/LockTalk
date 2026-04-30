import { render, screen, within } from "@testing-library/react";
import UserManagement from "./UserManagement";

describe("UserManagement Page", () => {
  beforeEach(() => {
    render(<UserManagement />);
  });

  /**
   * Multiple tables exist -> must select the DATA table (second one)
   */
  const getDataTable = () => {
    const tables = screen.getAllByRole("table");
    return tables[1]; // body table
  };

  test("renders user rows correctly", () => {
    const dataTable = getDataTable();

    expect(within(dataTable).getByText("Alice")).toBeInTheDocument();
    expect(within(dataTable).getByText("Bob")).toBeInTheDocument();
  });

  /**
   * Avoid global "Admin"/"User" collision with <option> elements
   * Scope inside each row instead
   */
  test("renders role labels correctly", () => {
    const aliceRow = screen.getByText("Alice").closest("tr")!;
    const bobRow = screen.getByText("Bob").closest("tr")!;

    expect(within(aliceRow).getByText("Admin")).toBeInTheDocument();
    expect(within(bobRow).getByText("User")).toBeInTheDocument();
  });

  /**
   * Same issue: "Active"/"Inactive" exists in dropdown AND table
   * MUST scope to rows
   */
  test("renders active/inactive badges correctly", () => {
    const aliceRow = screen.getByText("Alice").closest("tr")!;
    const bobRow = screen.getByText("Bob").closest("tr")!;

    expect(within(aliceRow).getByText("Active")).toBeInTheDocument();
    expect(within(bobRow).getByText("Inactive")).toBeInTheDocument();
  });
});
