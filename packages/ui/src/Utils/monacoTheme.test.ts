// PatternFly doesn't export its CodeEditor theme, so the test reads it from the internal module.
// If a PatternFly update changes that theme, this test fails and our copy needs the same change.
import { defineThemes as definePatternFlyThemes } from "@patternfly/react-code-editor/dist/esm/components/CodeEditor/CodeEditorTheme";
import { editor } from "monaco-editor";
import { DARK_MONACO_DIFF_TINTS, DIFF_TINTS } from "./diffTints";
import { MONACO_THEME_NAMES, defineMonacoThemes } from "./monacoTheme";

/**
 * Collects the themes that a define function passes to `defineTheme`, by name. It reads them from
 * the `defineTheme` mock of the global monaco-editor mock.
 */
const collectThemes = (define: (monacoEditor: typeof editor) => void) => {
  const defineTheme = vi.mocked(editor.defineTheme);

  defineTheme.mockClear();
  define(editor);

  return Object.fromEntries(defineTheme.mock.calls);
};

const patternFlyThemes = collectThemes(definePatternFlyThemes);
const ourThemes = collectThemes(defineMonacoThemes);

describe("defineMonacoThemes", () => {
  it.each`
    theme      | patternFlyName         | diffTints
    ${"light"} | ${"pf-v6-theme-light"} | ${DIFF_TINTS}
    ${"dark"}  | ${"pf-v6-theme-dark"}  | ${DARK_MONACO_DIFF_TINTS}
  `(
    "defines the $theme theme as PatternFly's CodeEditor theme plus the diff tints",
    ({ theme, patternFlyName, diffTints }) => {
      const patternFlyTheme = patternFlyThemes[patternFlyName];

      expect(ourThemes[MONACO_THEME_NAMES[theme]]).toEqual({
        ...patternFlyTheme,
        colors: {
          ...patternFlyTheme.colors,
          "diffEditor.removedLineBackground": diffTints.removed.background.value,
          "diffEditor.removedTextBackground": diffTints.removed.changedPartBackground.value,
          "diffEditor.insertedLineBackground": diffTints.added.background.value,
          "diffEditor.insertedTextBackground": diffTints.added.changedPartBackground.value,
        },
      });
    }
  );
});
