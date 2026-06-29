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
 * Whether a classified attribute should render inside the code editor
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
