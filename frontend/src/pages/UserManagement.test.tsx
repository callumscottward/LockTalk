import { render, screen, within } from "@testing-library/react";
import UserManagement from "./UserManagement";

describe("UserManagement Page", () => {
  test("renders role labels correctly", () => {
    render(<UserManagement />);

    const table = screen.getByRole("table");

    expect(within(table).getByText("Alice")).toBeInTheDocument();
    expect(within(table).getByText("Bob")).toBeInTheDocument();

    expect(within(table).getByText("Admin")).toBeInTheDocument();
    expect(within(table).getByText("User")).toBeInTheDocument();
  });

  test("renders active/inactive badges correctly", () => {
    render(<UserManagement />);

    const table = screen.getByRole("table");

    const aliceRow = within(table)
      .getByText("Alice")
      .closest("tr") as HTMLElement;

    const bobRow = within(table)
      .getByText("Bob")
      .closest("tr") as HTMLElement;

    expect(within(aliceRow).getByText("Active")).toBeInTheDocument();
    expect(within(bobRow).getByText("Inactive")).toBeInTheDocument();
  });
});
