import MarkdownIt from "markdown-it";
import { words } from "@/UI";
import stateTransferPlugin, { SetStateButtonDefaults } from "./StateTransferPlugin";

describe("StateTransferPlugin", () => {
  let md: MarkdownIt;

  beforeEach(() => {
    md = new MarkdownIt();
    stateTransferPlugin(md, "test-base-id", {});
  });

  describe("basic rendering", () => {
    it("shows error message when configuration is missing targetState", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain('<button class="pf-v6-c-button pf-m-primary pf-m-warning"');
      expect(html).toContain('type="button"');
      expect(html).toContain("disabled");
      expect(html).toContain('data-setstate-error="true"');
      expect(html).toContain(words("markdownContainer.setState.error.missingTargetState"));
    });

    it("renders button with custom display text from JSON when targetState is provided", () => {
      const markdown =
        '```setState\n{"displayText":"Apply Changes","targetState":"desired-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain("Apply Changes");
      expect(html).toContain(
        'data-setstate-content="{&quot;displayText&quot;:&quot;Apply Changes&quot;,&quot;targetState&quot;:&quot;desired-state&quot;}"'
      );
      expect(html).toContain('data-setstate-target="desired-state"');
    });

    it("renders button with targetState in data attribute", () => {
      const markdown = '```setState\n{"targetState":"desired-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('data-setstate-target="desired-state"');
      expect(html).toContain("data-setstate-content=");
    });

    it("uses targetState as displayText when displayText is not provided", () => {
      const markdown = '```setState\n{"targetState":"desired-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain("desired-state");
      expect(html).toContain('data-setstate-target="desired-state"');
    });

    it("uses custom displayText when both displayText and targetState are provided", () => {
      const markdown =
        '```setState\n{"displayText":"Apply Changes","targetState":"desired-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain("Apply Changes");
      // targetState appears in the data attribute, but not in the button text
      expect(html).toContain('data-setstate-target="desired-state"');
      // Check that the button text doesn't contain "desired-state" (it's only in the data attribute)
      const buttonTextMatch = html.match(/>([^<]+)</);
      expect(buttonTextMatch?.[1]).toBe("Apply Changes");
    });
  });

  describe("button type configuration", () => {
    it("renders primary button by default when valid config is provided", () => {
      const markdown = '```setState\n{"targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
    });

    it("renders secondary button when type is secondary", () => {
      const markdown = '```setState\n{"type":"secondary","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-secondary"');
      expect(html).not.toContain("pf-m-warning");
    });

    it("renders tertiary button when type is tertiary", () => {
      const markdown = '```setState\n{"type":"tertiary","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-tertiary"');
      expect(html).not.toContain("pf-m-warning");
    });

    it("renders link button when type is link", () => {
      const markdown = '```setState\n{"type":"link","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-link"');
      expect(html).not.toContain("pf-m-warning");
    });

    it("ignores invalid type values and defaults to primary", () => {
      const markdown = '```setState\n{"type":"invalid","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
      expect(html).not.toContain("pf-m-warning");
    });
  });

  describe("button variant configuration", () => {
    it("renders danger variant when variant is danger", () => {
      const markdown = '```setState\n{"variant":"danger","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-danger"');
      expect(html).not.toContain("pf-m-warning");
    });

    it("renders warning variant when variant is warning", () => {
      const markdown = '```setState\n{"variant":"warning","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-warning"');
    });

    it("ignores invalid variant values", () => {
      const markdown = '```setState\n{"variant":"invalid","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
      expect(html).not.toContain("pf-m-invalid");
      expect(html).not.toContain("pf-m-warning");
    });
  });

  describe("button modifiers", () => {
    it("adds inline modifier when isInline is true", () => {
      const markdown = '```setState\n{"isInline":true,"targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-inline"');
      expect(html).not.toContain("pf-m-warning");
    });

    it("adds inline modifier when isInline is string 'true'", () => {
      const markdown = '```setState\n{"isInline":"true","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-inline"');
      expect(html).not.toContain("pf-m-warning");
    });

    it("does not add inline modifier when isInline is false", () => {
      const markdown = '```setState\n{"isInline":false,"targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
      expect(html).not.toContain("pf-m-inline");
      expect(html).not.toContain("pf-m-warning");
    });

    it("adds small modifier when isSmall is true", () => {
      const markdown = '```setState\n{"isSmall":true,"targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-small"');
      expect(html).not.toContain("pf-m-warning");
    });

    it("adds small modifier when isSmall is string 'true'", () => {
      const markdown = '```setState\n{"isSmall":"true","targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary pf-m-small"');
      expect(html).not.toContain("pf-m-warning");
    });

    it("combines multiple modifiers correctly", () => {
      const markdown =
        '```setState\n{"type":"secondary","variant":"danger","isInline":true,"isSmall":true,"targetState":"test-state"}\n```';
      const html = md.render(markdown);

      expect(html).toContain(
        'class="pf-v6-c-button pf-m-secondary pf-m-danger pf-m-inline pf-m-small"'
      );
      expect(html).not.toContain("pf-m-warning");
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

  describe("non-JSON content", () => {
    it("treats plain text content as displayText", () => {
      const markdown = "```setState\nClick Me\n```";
      const html = md.render(markdown);

      expect(html).toContain("Click Me");
      expect(html).toContain('data-setstate-content="Click Me"');
    });

    it("uses default displayText when content is empty", () => {
      const markdown = "```setState\n\n```";
      const html = md.render(markdown);

      expect(html).toContain(words("markdownContainer.setState.error.cannotParseJson"));
    });

    it("handles whitespace-only content", () => {
      const markdown = "```setState\n   \n```";
      const html = md.render(markdown);

      // After trim, content is empty, so should use default
      expect(html).toContain(words("markdownContainer.setState.error.cannotParseJson"));
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

    it("handles null config (invalid format)", () => {
      const markdown = "```setState\nnull\n```";
      const html = md.render(markdown);

      expect(html).toContain(words("markdownContainer.setState.error.invalidConfig"));
      expect(html).toContain('data-setstate-error="true"');
      expect(html).toContain("disabled");
    });

    it("handles primitive value config (invalid format)", () => {
      const markdown = '```setState\n"string"\n```';
      const html = md.render(markdown);

      expect(html).toContain(words("markdownContainer.setState.error.invalidConfig"));
      expect(html).toContain('data-setstate-error="true"');
      expect(html).toContain("disabled");
    });

    it("handles invalid JSON gracefully", () => {
      const markdown = "```setState\n{invalid json}\n```";
      const html = md.render(markdown);

      // Should fall back to treating content as displayText
      expect(html).toContain("{invalid json}");
      expect(html).toContain('data-setstate-content="{invalid json}"');
    });

    it("handles JSON with only whitespace (missing targetState)", () => {
      const markdown = "```setState\n{ }\n```";
      const html = md.render(markdown);

      // Valid JSON (empty object), should show error about missing targetState
      expect(html).toContain(words("markdownContainer.setState.error.missingTargetState"));
      expect(html).toContain('data-setstate-content="{ }"');
      expect(html).toContain('data-setstate-error="true"');
      expect(html).toContain("disabled");
    });

    it("handles empty JSON object (missing targetState)", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain(words("markdownContainer.setState.error.missingTargetState"));
      expect(html).toContain('data-setstate-content="{}"');
      expect(html).toContain('data-setstate-error="true"');
      expect(html).toContain("disabled");
    });

    it("handles JSON array (invalid config format)", () => {
      const markdown = "```setState\n[]\n```";
      const html = md.render(markdown);

      // JSON.parse succeeds but config is an array, should show error
      expect(html).toContain(words("markdownContainer.setState.error.invalidConfigArray"));
      expect(html).toContain('data-setstate-error="true"');
      expect(html).toContain("disabled");
    });
  });

  describe("error handling", () => {
    it("disables button and shows warning variant when config has errors", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain("disabled");
      expect(html).toContain("pf-m-warning");
      expect(html).toContain('data-setstate-error="true"');
    });

    it("shows appropriate error message for missing configuration", () => {
      const markdown = "```setState\n{}\n```";
      const html = md.render(markdown);

      expect(html).toContain(words("markdownContainer.setState.error.missingTargetState"));
    });

    it("shows appropriate error message for array configuration", () => {
      const markdown = "```setState\n[]\n```";
      const html = md.render(markdown);

      expect(html).toContain(words("markdownContainer.setState.error.invalidConfigArray"));
    });

    it("shows appropriate error message for null configuration", () => {
      const markdown = "```setState\nnull\n```";
      const html = md.render(markdown);

      expect(html).toContain(words("markdownContainer.setState.error.invalidConfig"));
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

  describe("annotation-derived defaults (issue #7096)", () => {
    const withDefaults = (
      stateTransferDefaults: Record<string, SetStateButtonDefaults>
    ): MarkdownIt => {
      const instance = new MarkdownIt();

      stateTransferPlugin(instance, "test-base-id", { stateTransferDefaults });

      return instance;
    };

    it("uses the annotation default for a field the codeblock omits", () => {
      const defaultsMd = withDefaults({
        setting_start: { displayText: "Push settings", type: "secondary", variant: "warning" },
      });
      const markdown = '```setState\n{"targetState":"setting_start"}\n```';
      const html = defaultsMd.render(markdown);

      expect(html).toContain("Push settings");
      expect(html).toContain('class="pf-v6-c-button pf-m-secondary pf-m-warning"');
    });

    it("lets an explicit codeblock value win over the annotation default", () => {
      const defaultsMd = withDefaults({
        setting_start: { displayText: "Push settings", type: "secondary", variant: "warning" },
      });
      const markdown =
        '```setState\n{"targetState":"setting_start","displayText":"Custom label","type":"tertiary"}\n```';
      const html = defaultsMd.render(markdown);

      expect(html).toContain("Custom label");
      expect(html).not.toContain("Push settings");
      expect(html).toContain('class="pf-v6-c-button pf-m-tertiary pf-m-warning"');
    });

    it("falls back to the hard-coded default when neither the codeblock nor the annotations set a field", () => {
      const defaultsMd = withDefaults({});
      const markdown = '```setState\n{"targetState":"setting_start"}\n```';
      const html = defaultsMd.render(markdown);

      expect(html).toContain('class="pf-v6-c-button pf-m-primary"');
    });

    it("renders the annotation-derived icon", () => {
      const defaultsMd = withDefaults({
        setting_start: { icon: "FaSlidersH" },
      });
      const markdown = '```setState\n{"targetState":"setting_start"}\n```';
      const html = defaultsMd.render(markdown);

      expect(html).toContain('class="pf-v6-c-button__icon pf-m-start"');
      expect(html).toContain('data-testid="FaSlidersH"');
      expect(html).toContain("<svg");
    });

    it("does not render an icon when neither the codeblock nor the annotations set one", () => {
      const defaultsMd = withDefaults({});
      const markdown = '```setState\n{"targetState":"setting_start"}\n```';
      const html = defaultsMd.render(markdown);

      expect(html).not.toContain("pf-v6-c-button__icon");
      expect(html).not.toContain("<svg");
    });

    it("lets an explicit codeblock icon win over the annotation default", () => {
      const defaultsMd = withDefaults({
        setting_start: { icon: "FaSlidersH" },
      });
      const markdown = '```setState\n{"targetState":"setting_start","icon":"FaBook"}\n```';
      const html = defaultsMd.render(markdown);

      expect(html).toContain('data-testid="FaBook"');
      expect(html).not.toContain('data-testid="FaSlidersH"');
    });

    it("ignores an unrecognized icon name", () => {
      const defaultsMd = withDefaults({
        setting_start: { icon: "NotARealIcon" },
      });
      const markdown = '```setState\n{"targetState":"setting_start"}\n```';
      const html = defaultsMd.render(markdown);

      expect(html).not.toContain("pf-v6-c-button__icon");
    });

    it("does not apply defaults for a different target state", () => {
      const defaultsMd = withDefaults({
        setting_start: { displayText: "Push settings" },
      });
      const markdown = '```setState\n{"targetState":"other_state"}\n```';
      const html = defaultsMd.render(markdown);

      expect(html).not.toContain("Push settings");
      expect(html).toContain(">other_state<");
    });
  });
});
