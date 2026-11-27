import {
  t_global_font_family_mono,
  t_global_font_size_body_default,
} from "@patternfly/react-tokens";
import { Theme } from "../Components/DarkmodeOption";

/**
 * The Monaco theme of the diff editors for each app theme. The shell's Monaco setup defines them
 * with the PatternFly added and removed colors.
 */
export const DIFF_EDITOR_MONACO_THEMES: Record<Theme, string> = {
  light: "patternfly-diff-light",
  dark: "patternfly-diff-dark",
};

/** The size in px of 1rem, which Monaco needs to turn the PatternFly font size into px. */
const ROOT_FONT_SIZE = 16;

/**
 * The font of the diff editors: PatternFly's mono font at the body size, like the short values in
 * the attribute table. Monaco ignores CSS, so it gets them as options.
 */
export const DIFF_EDITOR_FONT_OPTIONS = {
  fontFamily: t_global_font_family_mono.value,
  fontSize: parseFloat(t_global_font_size_body_default.value) * ROOT_FONT_SIZE,
};
