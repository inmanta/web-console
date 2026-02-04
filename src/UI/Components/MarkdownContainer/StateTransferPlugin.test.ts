import MarkdownIt from "markdown-it";
import stateTransferPlugin from "./StateTransferPlugin";

describe("StateTransferPlugin", () => {
  let md: MarkdownIt;

  beforeEach(() => {
    md = new MarkdownIt();
    stateTransferPlugin(md, "test-base-id", {});
  });

  describe("basic rendering", () => {
    it("renders a setState fence as a button with default values", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain('<button class="pf-v6-c-button pf-m-primary"');
      expect(html).toContain('type="button"');
      expect(html).toContain('data-setstate-content="{}"');
      expect(html).toContain("Set State");
    });

    it("renders button with custom display text from JSON", () => {
      const markdown = '```setState\n{"displayText":"Apply Changes"}\n```';
      const html = md.render(markdown);

      expect(html).toContain("Apply Changes");
      expect(html).toContain(
        'data-setstate-content="{&quot;displayText&quot;:&quot;Apply Changes&quot;}"'
      );
    });

    it("renders button with targetState in data attribute", () => {
      const markdown = '```setState\n{"targetState":"desired-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('data-setstate-target="desired-state"');
      expect(html).toContain("data-setstate-content=");
    });
  });

  describe("button type configuration", () => {
    it("renders primary button by default", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
    });

    it("renders secondary button when type is secondary", () => {
      const markdown = '```setState\n{"type":"secondary"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-secondary"');
    });

    it("renders tertiary button when type is tertiary", () => {
      const markdown = '```setState\n{"type":"tertiary"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-tertiary"');
    });

    it("renders link button when type is link", () => {
      const markdown = '```setState\n{"type":"link"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-link"');
    });

    it("ignores invalid type values and defaults to primary", () => {
      const markdown = '```setState\n{"type":"invalid"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
    });
  });

  describe("button variant configuration", () => {
    it("renders danger variant when variant is danger", () => {
      const markdown = '```setState\n{"variant":"danger"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-danger"');
    });

    it("renders warning variant when variant is warning", () => {
      const markdown = '```setState\n{"variant":"warning"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-warning"');
    });

    it("ignores invalid variant values", () => {
      const markdown = '```setState\n{"variant":"invalid"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
      expect(html).not.toContain("pf-m-invalid");
    });
  });

  describe("button modifiers", () => {
    it("adds inline modifier when isInline is true", () => {
      const markdown = '```setState\n{"isInline":true}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-inline"');
    });

    it("adds inline modifier when isInline is string 'true'", () => {
      const markdown = '```setState\n{"isInline":"true"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-inline"');
    });

    it("does not add inline modifier when isInline is false", () => {
      const markdown = '```setState\n{"isInline":false}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
      expect(html).not.toContain("pf-m-inline");
    });

    it("adds small modifier when isSmall is true", () => {
      const markdown = '```setState\n{"isSmall":true}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-small"');
    });

    it("adds small modifier when isSmall is string 'true'", () => {
      const markdown = '```setState\n{"isSmall":"true"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-small"');
    });

    it("combines multiple modifiers correctly", () => {
      const markdown =
        '```setState\n{"type":"secondary","variant":"danger","isInline":true,"isSmall":true}\n```';
      const html = md.render(markdown);

      expect(html).toContain(
        'class="pf-v6-c-button pf-m-secondary pf-m-danger pf-m-inline pf-m-small"'
      );
    });
  });

  describe("complete configuration", () => {
    it("renders button with all options configured", () => {
      const markdown =
        '```setState\n{"displayText":"Deploy Now","type":"secondary","variant":"danger","targetState":"production","isInline":true,"isSmall":true}\n```';
      const html = md.render(markdown);

      expect(html).toContain("Deploy Now");
      expect(html).toContain(
        'class="pf-v6-c-button pf-m-secondary pf-m-danger pf-m-inline pf-m-small"'
      );
      expect(html).toContain('data-setstate-target="production"');
      expect(html).toContain("data-setstate-content=");
    });
  });

  describe("non-JSON content (backward compatibility)", () => {
    it("treats plain text content as displayText", () => {
      const markdown = "```setState\nClick Me\n```";
      const html = md.render(markdown);

      expect(html).toContain("Click Me");
      expect(html).toContain('data-setstate-content="Click Me"');
    });

    it("uses default displayText when content is empty", () => {
      const markdown = "```setState\n\n```";
      const html = md.render(markdown);

      expect(html).toContain("Set State");
    });

    it("handles whitespace-only content", () => {
      const markdown = "```setState\n   \n```";
      const html = md.render(markdown);

      // After trim, content is empty, so should use default
      expect(html).toContain("Set State");
    });
  });

  describe("HTML escaping", () => {
    it("escapes HTML in displayText", () => {
      const markdown = '```setState\n{"displayText":"<script>alert(1)</script>"}\n```';
      const html = md.render(markdown);

      expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
      expect(html).not.toContain("<script>");
    });

    it("escapes HTML in targetState", () => {
      const markdown = '```setState\n{"targetState":"<evil>state</evil>"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('data-setstate-target="&lt;evil&gt;state&lt;/evil&gt;"');
      expect(html).not.toContain("<evil>");
    });

    it("escapes HTML in content data attribute", () => {
      const markdown = '```setState\n{"displayText":"Test","targetState":"state"}\n```';
      const html = md.render(markdown);

      // Content should have escaped quotes
      expect(html).toContain(
        'data-setstate-content="{&quot;displayText&quot;:&quot;Test&quot;,&quot;targetState&quot;:&quot;state&quot;}"'
      );
    });
  });

  describe("non-setState fences", () => {
    it("delegates to default renderer for regular code fences", () => {
      const markdown = "```javascript\nconst x = 1;\n```";
      const html = md.render(markdown);

      expect(html).toContain("<pre");
      expect(html).toContain("<code");
      expect(html).not.toContain("pf-v6-c-button");
    });

    it("delegates to default renderer for fences without language", () => {
      const markdown = "```\nplain code\n```";
      const html = md.render(markdown);

      expect(html).toContain("<pre");
      expect(html).toContain("<code");
      expect(html).not.toContain("pf-v6-c-button");
    });

    it("delegates to default renderer for other language fences", () => {
      const markdown = "```python\ndef hello():\n    pass\n```";
      const html = md.render(markdown);

      expect(html).toContain("<pre");
      expect(html).toContain("<code");
      expect(html).not.toContain("pf-v6-c-button");
    });
  });

  describe("edge cases", () => {
    it("handles setState with extra whitespace in info", () => {
      const markdown = "```setState   \n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain("pf-v6-c-button");
    });

    it("handles invalid JSON gracefully", () => {
      const markdown = "```setState\n{invalid json}\n```";
      const html = md.render(markdown);

      // Should fall back to treating content as displayText
      expect(html).toContain("{invalid json}");
      expect(html).toContain('data-setstate-content="{invalid json}"');
    });

    it("handles JSON with only whitespace", () => {
      const markdown = "```setState\n{ }\n```";
      const html = md.render(markdown);

      // Valid JSON (empty object), should render with defaults
      expect(html).toContain("Set State");
      expect(html).toContain('data-setstate-content="{ }"');
    });

    it("handles empty JSON object", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain("Set State");
      expect(html).toContain('data-setstate-content="{}"');
    });

    it("handles JSON array (invalid config, falls back to displayText)", () => {
      const markdown = "```setState\n[]\n```";
      const html = md.render(markdown);

      // JSON.parse succeeds but config is not an object, so displayText won't be set
      // But since it's valid JSON, it won't fall back to plain text
      expect(html).toContain("Set State"); // Default displayText
    });
  });

  describe("data attributes", () => {
    it("always includes data-setstate-content attribute", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain("data-setstate-content=");
    });

    it("includes data-setstate-target when targetState is provided", () => {
      const markdown = '```setState\n{"targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('data-setstate-target="test-state"');
    });

    it("does not include data-setstate-target when targetState is missing", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).not.toContain("data-setstate-target=");
    });

    it("does not include data-setstate-target when targetState is empty string", () => {
      const markdown = '```setState\n{"targetState":""}\n```';
      const html = md.render(markdown);

      // Empty string is falsy, so attribute should not be added
      expect(html).not.toContain("data-setstate-target=");
    });
  });
});
