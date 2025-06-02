import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import copy from "copy-to-clipboard";
import { CodeEditorCopyControl } from "./CodeEditorControls";

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
