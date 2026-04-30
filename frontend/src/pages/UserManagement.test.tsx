import { render, screen, within } from "@testing-library/react";
import UserManagement from "./UserManagement";

describe("UserManagement Page", () => {
  test("renders user rows correctly", async () => {
    render(<UserManagement />);

    const alice = await screen.findByText("Alice");
    const bob = await screen.findByText("Bob");

    expect(alice).toBeInTheDocument();
    expect(bob).toBeInTheDocument();
  });

  test("renders role labels correctly", async () => {
    render(<UserManagement />);

    const alice = await screen.findByText("Alice");
    const bob = await screen.findByText("Bob");

    const aliceRow = alice.closest("tr")!;
    const bobRow = bob.closest("tr")!;

    expect(within(aliceRow).getByText("Admin")).toBeInTheDocument();
    expect(within(bobRow).getByText("User")).toBeInTheDocument();
  });

  test("renders active/inactive badges correctly", async () => {
    render(<UserManagement />);

    const alice = await screen.findByText("Alice");
    const bob = await screen.findByText("Bob");

    const aliceRow = alice.closest("tr")!;
    const bobRow = bob.closest("tr")!;

    expect(within(aliceRow).getByText("Active")).toBeInTheDocument();
    expect(within(bobRow).getByText("Inactive")).toBeInTheDocument();
  });
});
