import { Language } from "@patternfly/react-code-editor";
import { render, screen, fireEvent } from "@testing-library/react";
import copy from "copy-to-clipboard";
import { words } from "@/UI/words";
import { ReadOnlyCodeEditor } from "./ReadOnlyCodeEditor";

vi.mock("copy-to-clipboard", () => ({
  default: vi.fn(),
}));

vi.mock("@patternfly/react-code-editor", () => ({
  CodeEditor: ({ code, customControls, isDownloadEnabled, isLanguageLabelVisible, language }) => (
    <div>
      <pre>{code}</pre>
      {isLanguageLabelVisible && <span data-testid="language-label">{language}</span>}
      {customControls}
      {isDownloadEnabled && <button aria-label="Download code" />}
    </div>
  ),
  CodeEditorControl: ({ onClick, "aria-label": ariaLabel }) => (
    <button onClick={onClick} aria-label={ariaLabel} />
  ),
  Language: { json: "json", xml: "xml" },
}));

const plainValue = "const answer = 42;";

afterEach(() => {
  vi.clearAllMocks();
});

describe("ReadOnlyCodeEditor", () => {
  test("GIVEN a value WHEN rendered THEN shows it with copy, download, and expand controls", () => {
    render(<ReadOnlyCodeEditor value={plainValue} />);

    expect(screen.getByText(plainValue)).toBeVisible();
    expect(screen.getByRole("button", { name: words("copy") })).toBeVisible();
    expect(screen.getByRole("button", { name: "Download code" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Expand" })).toBeVisible();
  });

  test("GIVEN the copy control WHEN clicked THEN the displayed code is copied", () => {
    render(<ReadOnlyCodeEditor value={plainValue} />);

    fireEvent.click(screen.getByRole("button", { name: words("copy") }));

    expect(copy).toHaveBeenCalledWith(plainValue);
  });

  test("GIVEN a display-ready value WHEN rendered THEN it is shown and copied verbatim", () => {
    const formatted = '{\n  "a": 1\n}';

    render(<ReadOnlyCodeEditor value={formatted} language={Language.json} />);

    // The component shows the value as-is; it does not reformat.
    expect(screen.getByText((content) => content.includes('"a": 1'))).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: words("copy") }));

    expect(copy).toHaveBeenCalledWith(formatted);
  });

  test("GIVEN a language WHEN rendered THEN the language label is shown", () => {
    render(<ReadOnlyCodeEditor value='{"a": 1}' language={Language.json} />);

    expect(screen.getByTestId("language-label")).toHaveTextContent(Language.json);
  });

  test("GIVEN no language WHEN rendered THEN the language label is hidden", () => {
    render(<ReadOnlyCodeEditor value={plainValue} />);

    expect(screen.queryByTestId("language-label")).not.toBeInTheDocument();
  });

  test("GIVEN the expand control WHEN clicked THEN it toggles to a collapse control", () => {
    render(<ReadOnlyCodeEditor value={plainValue} />);

    fireEvent.click(screen.getByRole("button", { name: "Expand" }));

    expect(screen.getByRole("button", { name: "Collapse" })).toBeVisible();
  });
});
