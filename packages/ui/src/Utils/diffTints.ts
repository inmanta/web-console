import {
  t_color_green_60,
  t_color_green_70,
  t_color_red_60,
  t_color_red_70,
  t_global_color_nonstatus_green_default,
  t_global_color_nonstatus_green_hover,
  t_global_color_nonstatus_red_default,
  t_global_color_nonstatus_red_hover,
  t_global_text_color_nonstatus_on_green_default,
  t_global_text_color_nonstatus_on_red_default,
} from "@patternfly/react-tokens";

/** A PatternFly token, as `@patternfly/react-tokens` exports it. */
interface PatternFlyToken {
  name: string;
  value: string;
  var: string;
}

/** Whether a part of a diff was removed or added. */
export type DiffChange = "removed" | "added";

/**
 * The PatternFly tokens a removed or added value is tinted with.
 */
export interface DiffTint {
  /** The background of the whole changed value or line. */
  background: PatternFlyToken;

  /**
   * The background of the part that differs from the other side. PatternFly has no token for a
   * stronger shade of a background, so this is the hover token of `background`.
   */
  changedPartBackground: PatternFlyToken;

  /** The text on these backgrounds. */
  text: PatternFlyToken;
}

/**
 * The tints of the diffs in the attribute table, where they follow the app theme through their
 * CSS variables. In dark mode the backgrounds are light and meant for dark text. The light Monaco
 * theme uses them too.
 */
export const DIFF_TINTS: Record<DiffChange, DiffTint> = {
  removed: {
    background: t_global_color_nonstatus_red_default,
    changedPartBackground: t_global_color_nonstatus_red_hover,
    text: t_global_text_color_nonstatus_on_red_default,
  },
  added: {
    background: t_global_color_nonstatus_green_default,
    changedPartBackground: t_global_color_nonstatus_green_hover,
    text: t_global_text_color_nonstatus_on_green_default,
  },
};

/**
 * The tints of the Monaco diff editors in dark mode. Monaco's text is light there, so they use
 * darker steps of the same red and green as DIFF_TINTS.
 */
export const DARK_MONACO_DIFF_TINTS: Record<DiffChange, Omit<DiffTint, "text">> = {
  removed: { background: t_color_red_70, changedPartBackground: t_color_red_60 },
  added: { background: t_color_green_70, changedPartBackground: t_color_green_60 },
};

/**
 * The alpha, as a hex suffix, of the diff colors of the Monaco themes. Monaco needs them see-through
 * so selections and search matches stay visible on changed lines.
 */
const MONACO_DIFF_COLOR_ALPHA = "66";

/**
 * Creates the diff colors of a Monaco theme from the diff tints. Monaco takes static hex values, not
 * CSS variables, so neither Monaco theme follows the high contrast or glass mode.
 */
export const createMonacoDiffColors = (
  diffTints: Record<DiffChange, Omit<DiffTint, "text">>
): Record<string, string> => ({
  "diffEditor.removedLineBackground": diffTints.removed.background.value + MONACO_DIFF_COLOR_ALPHA,
  "diffEditor.removedTextBackground":
    diffTints.removed.changedPartBackground.value + MONACO_DIFF_COLOR_ALPHA,
  "diffEditor.insertedLineBackground": diffTints.added.background.value + MONACO_DIFF_COLOR_ALPHA,
  "diffEditor.insertedTextBackground":
    diffTints.added.changedPartBackground.value + MONACO_DIFF_COLOR_ALPHA,
});
