import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { words } from "@/UI/words";
import { CodeEditorControls, escapeNewlines } from "./CodeEditorControls";

// Mock the clipboard API
const mockClipboard = {
  writeText: jest.fn(),
};

// Mock the PatternFly CodeEditorControl component since all we want to test is the onClick event.
// The original component relies on the Monaco Editor which is not available in the test environment.
jest.mock("@patternfly/react-code-editor", () => ({
  CodeEditorControl: ({ onClick, icon, "aria-label": ariaLabel }) => (
    <button onClick={onClick} aria-label={ariaLabel} data-testid={`control-${ariaLabel}`}>
      {icon}
    </button>
  ),
}));

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: mockClipboard,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("CodeEditorControls", () => {
  const defaultProps = {
    code: "# Test Markdown\n\nThis is a test",
    service: "test-service",
    instance: "test-instance",
  };

  it("should render all control buttons", () => {
    render(<CodeEditorControls {...defaultProps} />);

    expect(screen.getByTestId("control-Copy")).toBeInTheDocument();
    expect(screen.getByTestId("control-Copy raw")).toBeInTheDocument();
    expect(
      screen.getByTestId(`control-${words("markdownPreviewer.download")}`)
    ).toBeInTheDocument();
  });

  it("should copy markdown content when copy button is clicked", () => {
    render(<CodeEditorControls {...defaultProps} />);

    const copyButton = screen.getByTestId("control-Copy");
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(defaultProps.code);
  });

  it("should copy raw markdown content with escaped newlines when raw copy button is clicked", () => {
    render(<CodeEditorControls {...defaultProps} />);

    const rawCopyButton = screen.getByTestId("control-Copy raw");
    fireEvent.click(rawCopyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith("# Test Markdown\\n\\nThis is a test");
  });
});

describe("escapeNewlines", () => {
  it("should escape newlines in a string", () => {
    const input = "Line 1\nLine 2\nLine 3";
    const expected = "Line 1\\nLine 2\\nLine 3";
    const result = escapeNewlines(input);
    expect(result).toBe(expected);
  });

  it("should handle empty string", () => {
    const input = "";
    const expected = "";
    const result = escapeNewlines(input);
    expect(result).toBe(expected);
  });

  it("should handle string without newlines", () => {
    const input = "No newlines here";
    const expected = "No newlines here";
    const result = escapeNewlines(input);
    expect(result).toBe(expected);
  });

  it("should handle multiple consecutive newlines", () => {
    const input = "Line 1\n\n\nLine 2";
    const expected = "Line 1\\n\\n\\nLine 2";
    const result = escapeNewlines(input);
    expect(result).toBe(expected);
  });
});
