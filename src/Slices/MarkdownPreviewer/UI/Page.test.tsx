import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { instanceData } from "@/Slices/ServiceInstanceDetails/Test/mockData";
import { defaultServer } from "@/Slices/ServiceInstanceDetails/Test/mockServer";
import { SetupWrapper } from "@/Slices/ServiceInstanceDetails/Test/mockSetup";
import { getThemePreference } from "@/UI/Components/DarkmodeOption";
import { words } from "@/UI/words";
import { MarkdownPreviewer } from "./MarkdownPreviewer";

// Mock the getThemePreference function
jest.mock("@/UI/Components/DarkmodeOption", () => ({
  getThemePreference: jest.fn().mockReturnValue("light"),
}));

// Mock the CodeEditor component to avoid Monaco editor issues
jest.mock("@patternfly/react-code-editor", () => ({
  CodeEditor: ({ code, onChange }: { code: string; onChange: (value: string) => void }) => (
    <div data-testid="code-editor">
      <textarea
        data-testid="code-editor-textarea"
        value={code}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  ),
  Language: {
    markdown: "markdown",
  },
}));

const defaultProps = {
  service: instanceData.service_entity,
  instance: "core1",
  instanceId: instanceData.id,
};

const setup = (props = defaultProps) => {
  return (
    <SetupWrapper expertMode={false}>
      <MarkdownPreviewer {...props} />
    </SetupWrapper>
  );
};

describe("MarkdownPreviewer", () => {
  beforeEach(() => {
    defaultServer.listen();
  });

  afterEach(() => {
    defaultServer.close();
  });

  it("should render successfully with all required props", async () => {
    render(setup());

    // Wait for the content to load and render
    await waitFor(() => {
      // Check if the page title is rendered
      expect(
        screen.getByText(`Markdown Preview: ${instanceData.service_entity} - ${instanceData.id}`)
      ).toBeVisible();

      // Check if the hint is visible by default
      expect(screen.getByText(words("markdownPreviewer.hint.title"))).toBeVisible();
      expect(screen.getByText(words("markdownPreviewer.hint.body"))).toBeVisible();

      // Check if the code editor and markdown preview are rendered
      expect(screen.getByTestId("code-editor")).toBeVisible();
    });
  });

  it("should close the hint when the close button is clicked", async () => {
    render(setup());

    // Wait for the content to load
    await waitFor(() => {
      expect(screen.getByText(words("markdownPreviewer.hint.title"))).toBeVisible();
    });

    // Find and click the close button
    const closeButton = screen.getByLabelText("Close hint");
    fireEvent.click(closeButton);

    // Check if the hint is no longer visible
    expect(screen.queryByText(words("markdownPreviewer.hint.title"))).not.toBeInTheDocument();
  });

  it("should handle dark theme correctly", async () => {
    // Override the mock to return dark theme
    (getThemePreference as jest.Mock).mockReturnValue("dark");

    render(setup());

    // Wait for the content to load
    await waitFor(() => {
      // The code editor should be visible
      const codeEditor = screen.getByTestId("code-editor");
      expect(codeEditor).toBeVisible();
    });
  });

  it("should handle code changes correctly", async () => {
    render(setup());

    // Wait for the content to load
    await waitFor(() => {
      expect(screen.getByTestId("code-editor")).toBeVisible();
    });

    // Find the code editor and simulate a change
    const textarea = screen.getByTestId("code-editor-textarea");
    const newCode = "# Updated Markdown\n\nThis is updated content";
    fireEvent.change(textarea, { target: { value: newCode } });

    // The markdown preview should update
    await waitFor(() => {
      // Check that the textarea has the new content
      expect(textarea).toHaveValue(newCode);

      // Check that both the editor and markdown preview have the content
      const elements = screen.getAllByText(/This is updated content/i);
      expect(elements).toHaveLength(2); // One in editor, one in preview
      elements.forEach((element) => expect(element).toBeVisible());
    });
  });
});
