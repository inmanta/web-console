import { escapeHtml } from "./escapeHtml";

describe("escapeHtml", () => {
  it("escapes the characters that would start markup", () => {
    expect(escapeHtml("<b>Fish & Chips</b>")).toEqual("&lt;b&gt;Fish &amp; Chips&lt;/b&gt;");
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("Basic service")).toEqual("Basic service");
  });
});
