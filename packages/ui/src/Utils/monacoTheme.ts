/**
 * The Monaco theme and font of every code, JSON and diff editor in the console: PatternFly's
 * CodeEditor theme plus the diff tints of the attribute table, and PatternFly's mono font.
 */
import { defineThemes as definePatternFlyThemes } from "@patternfly/react-code-editor/dist/esm/components/CodeEditor/CodeEditorTheme";
import {
  t_global_font_family_mono,
  t_global_font_line_height_body,
  t_global_font_size_body_default,
} from "@patternfly/react-tokens";
import { DARK_MONACO_DIFF_TINTS, DIFF_TINTS, createMonacoDiffColors } from "./diffTints";
import type { Theme } from "../Components/DarkmodeOption";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

const ROOT_FONT_SIZE = 16;

const MONACO_FONT_SIZE = parseFloat(t_global_font_size_body_default.value) * ROOT_FONT_SIZE;

/**
 * The line height in px of the Monaco editors: PatternFly's body line height at their font size.
 */
export const MONACO_LINE_HEIGHT = Math.round(
  MONACO_FONT_SIZE * parseFloat(t_global_font_line_height_body.value)
);

/**
 * The font of the Monaco editors: PatternFly's mono font at the body size and line height. Monaco
 * needs the size and line height in px. The explicit line height keeps it the same on every OS.
 */
export const MONACO_FONT_OPTIONS: editor.IEditorOptions = {
  fontFamily: t_global_font_family_mono.var,
  fontSize: MONACO_FONT_SIZE,
  lineHeight: MONACO_LINE_HEIGHT,
};

export const MONACO_THEME_NAMES: Record<Theme, string> = {
  light: "web-console-light",
  dark: "web-console-dark",
};

/**
 * Defines the Monaco themes of MONACO_THEME_NAMES: PatternFly's CodeEditor themes plus the diff
 * tints. PatternFly doesn't export its themes, so this collects them from its internal
 * `defineThemes`, which a PatternFly update can move. Editors call it before they mount, since
 * Monaco needs a theme defined before an editor can use it.
 */
export const defineMonacoThemes = (monacoEditor: Monaco["editor"]) => {
  const patternFlyThemes: Record<string, editor.IStandaloneThemeData> = {};

  definePatternFlyThemes({
    ...monacoEditor,
    defineTheme: (themeName, themeData) => {
      patternFlyThemes[themeName] = themeData;
    },
  });

  const lightTheme = patternFlyThemes["pf-v6-theme-light"];
  const darkTheme = patternFlyThemes["pf-v6-theme-dark"];

  monacoEditor.defineTheme(MONACO_THEME_NAMES.light, {
    ...lightTheme,
    colors: { ...lightTheme.colors, ...createMonacoDiffColors(DIFF_TINTS) },
  });
  monacoEditor.defineTheme(MONACO_THEME_NAMES.dark, {
    ...darkTheme,
    colors: { ...darkTheme.colors, ...createMonacoDiffColors(DARK_MONACO_DIFF_TINTS) },
  });
};
