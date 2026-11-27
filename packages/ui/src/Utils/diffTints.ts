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
 * The tints of the diffs, shared by the attribute table and the Monaco diff editors. In dark mode
 * the backgrounds are light and meant for dark text.
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
 * darker steps of the same red and green as DIFF_TINTS. PatternFly has no semantic token for
 * these, so they are palette steps and don't follow the high contrast or glass mode.
 */
export const DARK_MONACO_DIFF_TINTS: Record<DiffChange, Omit<DiffTint, "text">> = {
  removed: { background: t_color_red_70, changedPartBackground: t_color_red_60 },
  added: { background: t_color_green_70, changedPartBackground: t_color_green_60 },
};
