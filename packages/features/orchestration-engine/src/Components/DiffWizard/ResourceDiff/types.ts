import { DiffEditorProps, DiffOnMount } from "@monaco-editor/react";
import { AlertProps } from "@patternfly/react-core";
import { DIFF_EDITOR_FONT_OPTIONS, DiffChange } from "@inmanta/web-console-ui/Utils";

/** Monaco's diff editor, as the DiffEditor hands it to its onMount callback. */
export type MonacoDiffEditor = Parameters<DiffOnMount>[0];

/** The diff width in px from which the two sides sit next to each other instead of stacked. */
export const SIDE_BY_SIDE_MIN_WIDTH = 900;

/** How the diff editor places the two sides: next to each other, or stacked in one column. */
export type DiffEditorLayout = "sideBySide" | "stacked";

/**
 * The options of the line diff of a long value. Unchanged lines fold to 3 lines of context, a
 * change in indentation or trailing spaces counts as a change, and the mouse wheel keeps
 * scrolling the page, since the editor is as high as its content. It uses the PatternFly mono font.
 * Whether the sides sit next to each other is added from the width of the diff, see LongValueDiff.
 */
export const DIFF_EDITOR_OPTIONS: DiffEditorProps["options"] = {
  ...DIFF_EDITOR_FONT_OPTIONS,
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

/** The change each side of a diff shows: what the from side has is removed, what the to side has is added. */
export const DIFF_SIDE_CHANGES: Record<DiffSide, DiffChange> = {
  from: "removed",
  to: "added",
};

/** Both sides of a diff, in the order of their columns. */
export const DIFF_SIDES: DiffSide[] = ["from", "to"];

/** The columns of the attribute table: the attribute name, then one per side of the diff. */
export const ATTRIBUTE_TABLE_COLUMN_COUNT = DIFF_SIDES.length + 1;

/** The columns of the attribute table of a file resource, with one more for the hash row's actions. */
export const FILE_ATTRIBUTE_TABLE_COLUMN_COUNT = ATTRIBUTE_TABLE_COLUMN_COUNT + 1;

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

/** The variant and title of the inline alert that explains the diff status of a resource. */
export interface StatusAlertContent {
  /** The PatternFly variant, `custom` for unmodified, which gets a check icon. */
  variant: AlertProps["variant"];
  title: string;
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
