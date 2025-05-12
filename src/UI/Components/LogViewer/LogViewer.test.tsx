import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogViewerComponent, LogViewerData } from "./LogViewer";

// Mock data for testing
const mockLogs: LogViewerData[] = [
  {
    id: "1",
    name: "Log 1",
    data: ["Line 1", "Line 2", "Line 3"],
    duration: "1",
    failed: false,
  },
  {
    id: "2",
    name: "Failed Log",
    data: ["Error line 1", "Error line 2"],
    duration: "20",
    failed: true,
  },
];

describe("LogViewerComponent", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  it("renders with initial log data", () => {
    render(<LogViewerComponent logs={mockLogs} />);

    // Check if first log name is displayed in select
    expect(screen.getByRole("button", { name: /Log 1/i })).toBeInTheDocument();

    // Check if log content is displayed
    const logViewer = screen.getByTestId("log-viewer");
    expect(logViewer).toHaveTextContent("Line 1");
    expect(logViewer).toHaveTextContent("Line 2");
    expect(logViewer).toHaveTextContent("Line 3");

    // Check if duration is displayed
    expect(screen.getByText(/Duration: 1 s/)).toBeInTheDocument();
  });

  it("switches between logs when selecting from dropdown", async () => {
    render(<LogViewerComponent logs={mockLogs} />);

    // Open dropdown
    const toggle = screen.getByRole("button", { name: /Log 1/i });
    await userEvent.click(toggle);

    // Select second log
    const option = screen.getByRole("option", { name: /Failed Log/i });
    await userEvent.click(option);

    // Check if new log content is displayed
    const logViewer = screen.getByTestId("log-viewer");
    expect(logViewer).toHaveTextContent("Error line 1");
    expect(logViewer).toHaveTextContent("Error line 2");
    expect(screen.getByText(/Duration: 20 s/)).toBeInTheDocument();
  });

  it("shows error icon for failed logs", async () => {
    render(<LogViewerComponent logs={mockLogs} />);

    // Open dropdown
    const toggle = screen.getByRole("button", { name: /Log 1/i });
    await userEvent.click(toggle);

    // Find the failed log option and check for icon
    const failedLogOption = screen.getByRole("option", { name: /Failed Log/i });
    const icon = failedLogOption.querySelector(".pf-v6-c-icon__content.pf-m-danger");
    expect(icon).toBeInTheDocument();
  });

  it("toggles auto-scroll when pause/resume button is clicked", async () => {
    render(<LogViewerComponent logs={mockLogs} />);

    // Initially shows Pause
    const button = screen.getByRole("button", { name: /Pause Autoscroll/i });
    expect(button).toBeInTheDocument();

    // Click to pause
    await userEvent.click(button);
    expect(screen.getByRole("button", { name: /Resume Autoscroll/i })).toBeInTheDocument();

    // Click to resume
    await userEvent.click(screen.getByRole("button", { name: /Resume Autoscroll/i }));
    expect(screen.getByRole("button", { name: /Pause Autoscroll/i })).toBeInTheDocument();
  });

  it("handles download functionality", async () => {
    /**
     * Testing file downloads in JSDOM requires mocking because:
     * 1. JSDOM doesn't support actual file downloads
     * 2. The download process creates a temporary <a> element
     * 3. URL.createObjectURL is used to create a blob URL
     *
     * We need to mock:
     * - URL.createObjectURL/revokeObjectURL to handle blob URLs
     * - createElement('a') to prevent actual DOM manipulation
     * - link.click() to prevent navigation errors
     */
    // Mock the download mechanism
    const mockUrl = "blob:test";
    global.URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);
    global.URL.revokeObjectURL = jest.fn();

    // Mock createElement only for anchor elements
    const mockLink = { click: jest.fn(), href: "", download: "" };
    const originalCreateElement = document.createElement;
    const createElementSpy = jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName.toLowerCase() === "a") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return mockLink as any;
      }
      return originalCreateElement.call(document, tagName);
    });

    render(<LogViewerComponent logs={mockLogs} />);

    const downloadButton = screen.getByRole("button", { name: /Download current logs/i });
    await userEvent.click(downloadButton);

    // Verify download was triggered correctly
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockLink.click).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);

    // Cleanup
    createElementSpy.mockRestore();
  });

  it("handles scroll behavior", async () => {
    render(<LogViewerComponent logs={mockLogs} />);

    const logViewer = screen.getByTestId("log-viewer");

    // Initially shows Pause
    expect(screen.getByRole("button", { name: /Pause Autoscroll/i })).toBeInTheDocument();

    // Trigger scroll event with scrollOffsetToBottom > 1
    fireEvent(
      logViewer,
      new CustomEvent("scroll", {
        detail: { scrollOffsetToBottom: 100 },
      })
    );

    // Wait for state update to Resume
    await screen.findByRole("button", { name: /Resume Autoscroll/i });

    // Trigger scroll event with scrollOffsetToBottom <= 1
    // Simulate scrolling to bottom
    fireEvent(
      logViewer,
      new CustomEvent("scroll", {
        detail: { scrollOffsetToBottom: 0 },
      })
    );

    // Should show Pause again
    await screen.findByRole("button", { name: /Pause Autoscroll/i });
  });
});
