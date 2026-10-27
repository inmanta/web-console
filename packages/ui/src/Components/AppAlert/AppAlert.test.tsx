import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppAlert } from "./AppAlert";

describe("AppAlert", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the title and inline message when isInline=true", () => {
    render(<AppAlert title="InlineTitle" message="Inline message" isInline />);

    expect(screen.getByText("InlineTitle")).toBeVisible();

    const message = screen.getByText("Inline message");
    expect(message).toBeVisible();
    expect(message.tagName.toLowerCase()).toBe("span");
  });

  it("renders toast message inside pre-wrap container when isInline=false", () => {
    render(<AppAlert title="ToastTitle" message="line1\nline2" />);

    expect(screen.getByText("ToastTitle")).toBeVisible();

    const message = screen.getByText(
      (content) => content.includes("line1") && content.includes("line2")
    );
    expect(message).toBeVisible();
    expect(message).toHaveStyle("white-space: pre-line");
  });

  it("calls onClose callback when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<AppAlert title="Closable" message="Close this" onClose={onClose} />);

    const closeButton = screen.getByTestId("ToastAlert-close");
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render close button when onClose is not provided", () => {
    render(<AppAlert title="NoClose" message="not closable" />);

    expect(screen.queryByTestId("ToastAlert-close")).toBeNull();
  });

  it("passes data-testid through to the root Alert", () => {
    render(<AppAlert title="TestId" message="message" testId="app-alert-test" />);

    expect(screen.getByTestId("app-alert-test")).toBeVisible();
  });
});
