import markdownit, { type MarkdownIt } from "markdown-it";
import patternFlyTablePlugin from "./PatternFlyTablePlugin";

describe("PatternFlyTablePlugin", () => {
  let md: MarkdownIt;

  const table = [
    "| **Name** | IGP metric |",
    "| --- | --- |",
    "| router-south | `10` |",
    "| router-north | 20 |",
  ].join("\n");

  beforeEach(() => {
    md = new markdownit();
    md.use(patternFlyTablePlugin);
  });

  it("stamps PatternFly table classes on the table elements", () => {
    const html = md.render(table);

    expect(html).toContain('<table class="pf-v6-c-table pf-m-grid-md pf-m-compact">');
    expect(html).toContain('<thead class="pf-v6-c-table__thead">');
    expect(html).toContain('<tbody class="pf-v6-c-table__tbody">');
    expect(html).toContain('<tr class="pf-v6-c-table__tr">');
  });

  it("wraps each table in a scroll container", () => {
    const html = md.render(table);

    expect(html).toMatch(
      /^<div class="pf-v6-c-scroll-inner-wrapper">\n<table [^>]*>[\s\S]*<\/table>\n<\/div>\n$/
    );
  });

  it("makes every header and body cell wrap instead of truncate", () => {
    const html = md.render(table);

    expect(html).toContain('<th class="pf-v6-c-table__th pf-m-wrap">IGP metric</th>');
    expect(html).toContain('<td class="pf-v6-c-table__td pf-m-wrap" data-label="Name">');
  });

  it("labels body cells with their column header, markup stripped", () => {
    const html = md.render(table);

    expect(html).toContain('data-label="Name">router-south</td>');
    expect(html).toContain('data-label="IGP metric"><code>10</code></td>');
    expect(html).toContain('data-label="IGP metric">20</td>');
  });

  it("does not label cells when the header is empty", () => {
    const html = md.render("| | Value |\n| --- | --- |\n| a | b |");

    expect(html).toContain('<td class="pf-v6-c-table__td pf-m-wrap">a</td>');
    expect(html).toContain('data-label="Value">b</td>');
  });

  it("resets column labels between tables", () => {
    const html = md.render(`${table}\n\n| Other |\n| --- |\n| x |`);

    expect(html).toContain('data-label="Other">x</td>');
  });

  it("leaves non-table markdown untouched", () => {
    expect(md.render("# Title\n\nSome *text*")).toBe("<h1>Title</h1>\n<p>Some <em>text</em></p>\n");
  });
});
