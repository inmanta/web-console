/**
 * The Monaco theme and font of every code, JSON and diff editor in the console. The theme is a copy
 * of the one PatternFly's CodeEditor defines (PatternFly doesn't export it), built from the same
 * tokens, plus the diff tints of the attribute table.
 */
import {
  t_color_blue_30,
  t_color_blue_50,
  t_color_gray_30,
  t_color_gray_50,
  t_color_gray_90,
  t_color_green_30,
  t_color_green_50,
  t_color_orange_30,
  t_color_orange_50,
  t_color_purple_30,
  t_color_purple_50,
  t_color_red_30,
  t_color_red_50,
  t_color_teal_30,
  t_color_teal_50,
  t_color_white,
  t_color_yellow_30,
  t_color_yellow_50,
  t_global_font_family_mono,
  t_global_font_line_height_body,
  t_global_font_size_body_default,
  t_global_text_color_100,
  t_global_text_color_200,
} from "@patternfly/react-tokens";
import { Theme } from "../Components/DarkmodeOption";
import { DARK_MONACO_DIFF_TINTS, DIFF_TINTS, DiffChange, DiffTint } from "./diffTints";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

/** The size in px of 1rem, which Monaco needs to turn the PatternFly font size into px. */
const ROOT_FONT_SIZE = 16;

/**
 * The font size in px of the Monaco editors: PatternFly's body size, like the short values in the
 * attribute table.
 */
const MONACO_FONT_SIZE = parseFloat(t_global_font_size_body_default.value) * ROOT_FONT_SIZE;

/**
 * The line height in px of the Monaco editors: PatternFly's body line height at their font size.
 */
export const MONACO_LINE_HEIGHT = Math.round(
  MONACO_FONT_SIZE * parseFloat(t_global_font_line_height_body.value)
);

/**
 * The font of the Monaco editors: PatternFly's mono font at the body size and line height. Monaco
 * ignores CSS, so it gets them as options. The explicit line height keeps it the same on every OS.
 */
export const MONACO_FONT_OPTIONS: editor.IEditorOptions = {
  fontFamily: t_global_font_family_mono.value,
  fontSize: MONACO_FONT_SIZE,
  lineHeight: MONACO_LINE_HEIGHT,
};

/** The name of the Monaco theme for each app theme. */
export const MONACO_THEME_NAMES: Record<Theme, string> = {
  light: "web-console-light",
  dark: "web-console-dark",
};

/**
 * The colors of a Monaco theme, as hex values, since Monaco ignores CSS variables.
 */
interface MonacoThemeColors {
  background: string;
  text: string;

  /** The text of the line numbers that don't have the cursor. */
  subtleText: string;
  red: string;
  orange: string;
  yellow: string;
  green: string;
  teal: string;
  blue: string;
  purple: string;
  gray: string;
}

/** The colors of the Monaco theme for each app theme, the same steps as PatternFly's CodeEditor. */
const MONACO_THEME_COLORS: Record<Theme, MonacoThemeColors> = {
  light: {
    background: t_color_white.value,
    text: t_global_text_color_100.value,
    subtleText: t_global_text_color_200.value,
    red: t_color_red_50.value,
    orange: t_color_orange_50.value,
    yellow: t_color_yellow_50.value,
    green: t_color_green_50.value,
    teal: t_color_teal_50.value,
    blue: t_color_blue_50.value,
    purple: t_color_purple_50.value,
    gray: t_color_gray_50.value,
  },
  dark: {
    background: t_color_gray_90.value,
    text: t_color_white.value,
    subtleText: t_color_gray_30.value,
    red: t_color_red_30.value,
    orange: t_color_orange_30.value,
    yellow: t_color_yellow_30.value,
    green: t_color_green_30.value,
    teal: t_color_teal_30.value,
    blue: t_color_blue_30.value,
    purple: t_color_purple_30.value,
    gray: t_color_gray_30.value,
  },
};

/** The diff tints of the Monaco theme for each app theme. */
const MONACO_THEME_DIFF_TINTS: Record<Theme, Record<DiffChange, Omit<DiffTint, "text">>> = {
  light: DIFF_TINTS,
  dark: DARK_MONACO_DIFF_TINTS,
};

/**
 * Creates the Monaco theme for an app theme: the colors and syntax rules of PatternFly's
 * CodeEditor theme, plus the diff tints.
 */
const createMonacoTheme = (theme: Theme): editor.IStandaloneThemeData => {
  const colors = MONACO_THEME_COLORS[theme];
  const diffTints = MONACO_THEME_DIFF_TINTS[theme];

  return {
    base: theme === "light" ? "vs" : "vs-dark",
    inherit: true,
    colors: {
      "editor.background": colors.background,
      "editor.foreground": colors.text,
      "editorLineNumber.activeForeground": colors.text,
      "editorLineNumber.foreground": colors.subtleText,
      "diffEditor.removedLineBackground": diffTints.removed.background.value,
      "diffEditor.removedTextBackground": diffTints.removed.changedPartBackground.value,
      "diffEditor.insertedLineBackground": diffTints.added.background.value,
      "diffEditor.insertedTextBackground": diffTints.added.changedPartBackground.value,
    },
    rules: [
      { token: "", foreground: colors.text, background: colors.background },
      { token: "invalid", foreground: colors.red },
      { token: "emphasis", fontStyle: "italic" },
      { token: "strong", fontStyle: "bold" },
      { token: "variable", foreground: colors.blue },
      { token: "variable.predefined", foreground: colors.teal },
      { token: "constant", foreground: colors.orange },
      { token: "comment", foreground: colors.gray },
      { token: "number", foreground: colors.orange },
      { token: "number.hex", foreground: colors.blue },
      { token: "regexp", foreground: colors.red },
      { token: "annotation", foreground: colors.purple },
      { token: "type", foreground: colors.yellow },
      { token: "delimiter", foreground: colors.text },
      { token: "delimiter.html", foreground: colors.gray },
      { token: "delimiter.xml", foreground: colors.blue },
      { token: "tag", foreground: colors.red },
      { token: "tag.id.jade", foreground: colors.teal },
      { token: "tag.class.jade", foreground: colors.teal },
      { token: "meta.scss", foreground: colors.red },
      { token: "metatag", foreground: colors.orange },
      { token: "metatag.content.html", foreground: colors.red },
      { token: "metatag.html", foreground: colors.gray },
      { token: "metatag.xml", foreground: colors.gray },
      { token: "metatag.php", fontStyle: "bold" },
      { token: "key", foreground: colors.orange },
      { token: "string.key.json", foreground: colors.red },
      { token: "string.value.json", foreground: colors.blue },
      { token: "attribute.name", foreground: colors.red },
      { token: "attribute.value", foreground: colors.blue },
      { token: "attribute.value.number", foreground: colors.orange },
      { token: "attribute.value.unit", foreground: colors.orange },
      { token: "attribute.value.html", foreground: colors.blue },
      { token: "attribute.value.xml", foreground: colors.blue },
      { token: "string", foreground: colors.green },
      { token: "string.html", foreground: colors.green },
      { token: "string.sql", foreground: colors.green },
      { token: "string.yaml", foreground: colors.green },
      { token: "keyword", foreground: colors.purple },
      { token: "keyword.json", foreground: colors.purple },
      { token: "keyword.flow", foreground: colors.purple },
      { token: "keyword.flow.scss", foreground: colors.purple },
      { token: "operator.scss", foreground: colors.text },
      { token: "operator.sql", foreground: colors.text },
      { token: "operator.swift", foreground: colors.text },
      { token: "predefined.sql", foreground: colors.purple },
    ],
  };
};

/**
 * Defines the Monaco themes of MONACO_THEME_NAMES. Editors call it before they mount, since Monaco
 * needs a theme defined before an editor can use it.
 */
export const defineMonacoThemes = (monacoEditor: Pick<Monaco["editor"], "defineTheme">) => {
  monacoEditor.defineTheme(MONACO_THEME_NAMES.light, createMonacoTheme("light"));
  monacoEditor.defineTheme(MONACO_THEME_NAMES.dark, createMonacoTheme("dark"));
};
