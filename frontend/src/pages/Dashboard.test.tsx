import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "./Dashboard";

// override fetch per test
beforeEach(() => {
  (fetch as any).mockImplementation(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          {
            id: 1,
            name: "Test Conversation",
            participants: [{ username: "Alice" }],
          },
        ]),
    })
  );
});

describe("Dashboard", () => {

  it("renders chats sidebar", () => {
    render(<Dashboard />);
    expect(screen.getByText(/chat/i)).toBeInTheDocument();
  });

  it("loads conversations", async () => {
    render(<Dashboard />);

    expect(
      await screen.findByText(/test conversation/i)
    ).toBeInTheDocument();
  });

  it("typing message updates input", async () => {
    render(<Dashboard />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "hello");

    expect(input).toHaveValue("hello");
  });

});
