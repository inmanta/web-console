import { render, screen, waitFor, act, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppAlertProvider, useAppAlert } from "./AppAlertProvider";

const MockedAppAlertUser = () => {
  const { notify, notifySuccess, notifyError, notifyInfo } = useAppAlert();

  return (
    <div>
      <button onClick={() => notify("Test title", "Test message", "ToastAlert")}>Show Alert</button>
      <button onClick={() => notifySuccess("Success title", "Success message", "SuccessToast")}>
        Show Success
      </button>
      <button onClick={() => notifyError("Error title", "Error message", "ErrorToast")}>
        Show Error
      </button>
      <button onClick={() => notifyInfo("Info title", "Info message", "InfoToast")}>
        Show Info
      </button>
    </div>
  );
};

const setup = () =>
  render(
    <AppAlertProvider>
      <MockedAppAlertUser />
    </AppAlertProvider>
  );

describe("AppAlertProvider", () => {
  afterEach(() => {
    // Remove rendered DOM between tests to avoid leaking elements into the next test.
    cleanup();

    // If fake timers are active, flush any queued timer callbacks and restore real timers.
    // This prevents timer state from leaking into later tests.
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }

    // Ensure no timers remain references at the end of the test run.
    vi.clearAllTimers();
  });

  it("renders children correctly", () => {
    setup();
    expect(screen.getByText("Show Alert")).toBeVisible();
  });

  it("does not render any alert by default", () => {
    setup();
    expect(screen.queryByTestId("ToastAlert")).toBeNull();
  });

  it("shows an alert when notify is called", async () => {
    setup();

    await userEvent.click(screen.getByText("Show Alert"));

    expect(screen.getByTestId("ToastAlert")).toBeVisible();
    expect(screen.getByText("Test title")).toBeVisible();
    expect(screen.getByText("Test message")).toBeVisible();
  });

  it("supports notifySuccess, notifyError, notifyInfo", async () => {
    setup();

    await userEvent.click(screen.getByText("Show Success"));
    expect(screen.getByTestId("SuccessToast")).toBeVisible();
    expect(screen.getByText("Success title")).toBeVisible();

    await userEvent.click(screen.getByText("Show Error"));
    expect(screen.getByTestId("ErrorToast")).toBeVisible();
    expect(screen.getByText("Error title")).toBeVisible();

    await userEvent.click(screen.getByText("Show Info"));
    expect(screen.getByTestId("InfoToast")).toBeVisible();
    expect(screen.getByText("Info title")).toBeVisible();
  });

  it("closes the alert when the close button is clicked", async () => {
    setup();

    await userEvent.click(screen.getByText("Show Alert"));
    expect(screen.getByTestId("ToastAlert")).toBeVisible();

    const closeButton = screen.getByTestId("alertClose");
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("ToastAlert")).toBeNull();
    });
  });

  it("auto-dismisses the alert after 8 seconds", async () => {
    vi.useFakeTimers();

    setup();
    fireEvent.click(screen.getByText("Show Alert"));
    expect(screen.getByTestId("ToastAlert")).toBeVisible();

    await act(async () => {
      await vi.advanceTimersByTime(8000);
    });

    expect(screen.queryByTestId("ToastAlert")).toBeNull();
  });

  it("does not throw when notify is called without testId, message or variant", async () => {
    const Wrapper = () => {
      const { notify } = useAppAlert();
      return <button onClick={() => notify("No testid")}>No TestId</button>;
    };

    render(
      <AppAlertProvider>
        <Wrapper />
      </AppAlertProvider>
    );

    await userEvent.click(screen.getByText("No TestId"));
    expect(await screen.findByTestId("ToastAlert")).toBeVisible();
  });
});
