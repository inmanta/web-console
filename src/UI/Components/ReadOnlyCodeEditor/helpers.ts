import { CodeEditorProps, Language } from "@patternfly/react-code-editor";
import type { ClassifiedAttribute } from "@/Data";

/**
 * The classified kinds that render inside the editor, mapped to their
 * highlighting language. `Code` is generic content shown without highlighting,
 * so it maps to `undefined` — listed explicitly so the set of editor kinds and
 * their languages live in one place. Kinds absent from this map render inline
 * as plain text instead of in the editor.
 */
const EDITOR_LANGUAGE: Partial<Record<ClassifiedAttribute["kind"], CodeEditorProps["language"]>> = {
  Json: Language.json,
  Xml: Language.xml,
  Code: undefined,
};

/**
 * Whether a classified attribute should render inside the {@link ReadOnlyCodeEditor}
 * (structured or multiline "code") rather than inline as plain text.
 *
 * @param kind - The classified attribute kind.
 */
export function isEditorKind(kind: ClassifiedAttribute["kind"]): boolean {
  return kind in EDITOR_LANGUAGE;
}

/**
 * Maps a classified attribute kind to the editor's highlighting language,
 * returning `undefined` for generic code and for kinds not shown in the editor.
 *
 * @param kind - The classified attribute kind.
 */
export function languageForKind(kind: ClassifiedAttribute["kind"]): CodeEditorProps["language"] {
  return EDITOR_LANGUAGE[kind];
}

/**
 * Determines the height for code editors based on content length.
 * Uses explicit px values instead of "sizeToFit" because PatternFly's sizeToFit
 * calls editor.layout() but never updates the container's CSS height, leaving
 * the container at 0px (invalid CSS value) while Monaco overflows it.
 *
 * Monaco line height: Math.round(GOLDEN_LINE_HEIGHT_RATIO * fontSize)
 *   Windows/Linux: Math.round(1.35 * 14) = 19px
 *   macOS:         Math.round(1.5  * 12) = 18px
 * Using 19px covers both platforms (slightly tall on macOS — better than too short).
 * The height prop targets the Monaco container only; the toolbar sits outside it.
 *
 * @param code - The display-ready code shown in the editor.
 * @returns A CSS px height string, capped at 300px.
 */
export function getDefaultHeightEditor(code: string): string {
  const lineCount = code.split("\n").length;

  return `${Math.min(lineCount * 19, 300)}px`;
}
