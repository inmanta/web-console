import { DiffEditorProps, DiffOnMount } from "@monaco-editor/react";

/** Monaco's diff editor, as the DiffEditor hands it to its onMount callback. */
export type MonacoDiffEditor = Parameters<DiffOnMount>[0];

/** The diff width in px from which the two sides sit next to each other instead of stacked. */
export const SIDE_BY_SIDE_MIN_WIDTH = 900;

/**
 * The options of the line diff of a long value. Unchanged lines fold to 3 lines of context, a
 * change in indentation or trailing spaces counts as a change, and the mouse wheel keeps
 * scrolling the page, since the editor is as high as its content. Whether the sides sit next to
 * each other is added from the width of the diff, see LongValueDiff.
 */
export const DIFF_EDITOR_OPTIONS: DiffEditorProps["options"] = {
  readOnly: true,
  ignoreTrimWhitespace: false,
  useInlineViewWhenSpaceIsLimited: false,
  hideUnchangedRegions: { enabled: true, contextLineCount: 3 },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  minimap: { enabled: false },
  renderOverviewRuler: false,
  scrollbar: { alwaysConsumeMouseWheel: false },
};

/** The height in px of the line diff until Monaco has computed its first diff. */
export const INITIAL_DIFF_EDITOR_HEIGHT = 100;

/**
 * One side of a diff: `from` is the state the diff starts from (the current state or the older
 * model version), `to` the model version it goes to.
 */
export type DiffSide = "from" | "to";

/** Both sides of a diff, in the order of their columns. */
export const DIFF_SIDES: DiffSide[] = ["from", "to"];

/** The columns of the attribute table: the attribute name, then one per side of the diff. */
export const ATTRIBUTE_TABLE_COLUMN_COUNT = DIFF_SIDES.length + 1;

/**
 * A short value split around the part that differs from the value on the other side.
 */
export interface ValueParts {
  /** The start the value shares with the other side. */
  commonStart: string;

  /** The part that differs from the other side, empty when both values are equal. */
  changed: string;

  /** The end the value shares with the other side. */
  commonEnd: string;
}

/**
 * Where the strip with the side labels splits and where its labels start, in px, taken from the
 * layout of the diff editor below it so both line up.
 */
export interface SideLabelsLayout {
  /** The width of the editor of the side the diff starts from. */
  fromWidth: number;

  /** Where the code starts in that editor, after its line numbers. */
  fromCodeStart: number;

  /** Where the code starts in the editor of the side the diff goes to. */
  toCodeStart: number;
}
