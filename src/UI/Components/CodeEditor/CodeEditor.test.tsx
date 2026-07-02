import { render, screen } from "@testing-library/react";
import { words } from "@/UI/words";
import { CodeEditor } from "./CodeEditor";

describe("CodeEditor", () => {
  test("shows the copy control and an expand toggle when no explicit height is given", () => {
    render(<CodeEditor code={"line 1\nline 2"} />);

    expect(screen.getByRole("button", { name: words("copy") })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: words("expand") })).toBeInTheDocument();
  });

  test("drops the expand toggle when an explicit height is set", () => {
    render(<CodeEditor code="content" height="400px" />);

    expect(screen.getByRole("button", { name: words("copy") })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: words("expand") })).not.toBeInTheDocument();
  });

  test("hides the copy control when isCopyEnabled is false", () => {
    render(<CodeEditor code="content" height="400px" isCopyEnabled={false} />);

    expect(screen.queryByRole("button", { name: words("copy") })).not.toBeInTheDocument();
  });

  test("shows the raw copy control when rawValue differs from code", () => {
    render(<CodeEditor code={'{\n  "a": 1\n}'} rawValue={'{"a":1}'} height="400px" />);

    expect(screen.getByRole("button", { name: words("copy.raw") })).toBeInTheDocument();
  });

  test("hides the raw copy control when rawValue equals code", () => {
    render(<CodeEditor code="content" rawValue="content" height="400px" />);

    expect(screen.queryByRole("button", { name: words("copy.raw") })).not.toBeInTheDocument();
  });

  test("hides the raw copy control when rawValue is omitted", () => {
    render(<CodeEditor code="content" height="400px" />);

    expect(screen.queryByRole("button", { name: words("copy.raw") })).not.toBeInTheDocument();
  });

  test("hides the raw copy control when isCopyEnabled is false", () => {
    render(<CodeEditor code="content" rawValue="raw" height="400px" isCopyEnabled={false} />);

    expect(screen.queryByRole("button", { name: words("copy.raw") })).not.toBeInTheDocument();
  });
});
