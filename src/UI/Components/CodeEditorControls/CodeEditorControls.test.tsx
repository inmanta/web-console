import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import copy from "copy-to-clipboard";
import { CodeEditorCopyControl, CodeEditorHeightToggleControl } from "./CodeEditorControls";

// Mock copy-to-clipboard
jest.mock("copy-to-clipboard", () => jest.fn());

// Mock the PatternFly CodeEditorControl component
jest.mock("@patternfly/react-code-editor", () => ({
  CodeEditorControl: ({ onClick, icon, "aria-label": ariaLabel }) => (
    <button onClick={onClick} aria-label={ariaLabel} data-testid={`control-${ariaLabel}`}>
      {icon}
    </button>
  ),
}));

describe("CodeEditorCopyControl", () => {
  const defaultProps = {
    code: "const test = 'Hello World';",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the copy button", () => {
    render(<CodeEditorCopyControl {...defaultProps} />);
    expect(screen.getByTestId("control-Copy")).toBeInTheDocument();
  });

  it("should copy code when copy button is clicked", () => {
    render(<CodeEditorCopyControl {...defaultProps} />);

    const copyButton = screen.getByTestId("control-Copy");
    fireEvent.click(copyButton);

    expect(copy).toHaveBeenCalledWith(defaultProps.code);
  });
});

describe("CodeEditorHeightToggleControl", () => {
  const mockOnToggle = vi.fn();

  const defaultProps = {
    code: "const test = 'Hello World';",
    isExpanded: false,
    onToggle: mockOnToggle,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("when collapsed (isExpanded: false)", () => {
    it("should render the expand button", () => {
      render(<CodeEditorHeightToggleControl {...defaultProps} />);
      expect(screen.getByTestId("control-Expand")).toBeInTheDocument();
    });

    it("should have correct aria-label when collapsed", () => {
      render(<CodeEditorHeightToggleControl {...defaultProps} />);
      const button = screen.getByTestId("control-Expand");
      expect(button).toHaveAttribute("aria-label", "Expand");
    });

    it("should call onToggle when expand button is clicked", () => {
      render(<CodeEditorHeightToggleControl {...defaultProps} />);

      const expandButton = screen.getByTestId("control-Expand");
      fireEvent.click(expandButton);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("when expanded (isExpanded: true)", () => {
    const expandedProps = {
      ...defaultProps,
      isExpanded: true,
    };

    it("should render the collapse button", () => {
      render(<CodeEditorHeightToggleControl {...expandedProps} />);
      expect(screen.getByTestId("control-Collapse")).toBeInTheDocument();
    });

    it("should have correct aria-label when expanded", () => {
      render(<CodeEditorHeightToggleControl {...expandedProps} />);
      const button = screen.getByTestId("control-Collapse");
      expect(button).toHaveAttribute("aria-label", "Collapse");
    });

    it("should call onToggle when collapse button is clicked", () => {
      render(<CodeEditorHeightToggleControl {...expandedProps} />);

      const collapseButton = screen.getByTestId("control-Collapse");
      fireEvent.click(collapseButton);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });

  it("should toggle between expand and collapse states", () => {
    const { rerender } = render(<CodeEditorHeightToggleControl {...defaultProps} />);

    // Initially collapsed, should show expand button
    expect(screen.getByTestId("control-Expand")).toBeInTheDocument();
    expect(screen.queryByTestId("control-Collapse")).not.toBeInTheDocument();

    // Rerender with expanded state
    rerender(<CodeEditorHeightToggleControl {...defaultProps} isExpanded={true} />);

    // Now expanded, should show collapse button
    expect(screen.getByTestId("control-Collapse")).toBeInTheDocument();
    expect(screen.queryByTestId("control-Expand")).not.toBeInTheDocument();
  });
});
