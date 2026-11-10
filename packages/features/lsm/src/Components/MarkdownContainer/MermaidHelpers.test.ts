import { words } from "@inmanta/web-console-core";
import { showMermaidError } from "./MermaidHelpers";

describe("showMermaidError", () => {
  it("renders the error message as text, so markup in the diagram source is never parsed", () => {
    const block = document.createElement("pre");
    const payload = '<img src="x" onerror="alert(1)">';

    showMermaidError(block, new Error(`Parse error on line 1:\n${payload}`));

    const message = block.querySelector(".mermaid-error-message code");

    expect(block.querySelector("img")).toBeNull();
    expect(message?.textContent).toBe(`Parse error on line 1:\n${payload}`);
    expect(block.querySelector(".mermaid-error-message strong")?.textContent).toBe(
      words("markdownContainer.error.mermaid.title")
    );
  });

  it("falls back to the unknown error text when the error has no message", () => {
    const block = document.createElement("pre");

    showMermaidError(block, "");

    expect(block.querySelector(".mermaid-error-message code")?.textContent).toBe(
      words("error.unknown")
    );
  });
});
