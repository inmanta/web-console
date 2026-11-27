import React from "react";
import { DiffEditor as ReactMonacoDiffEditor, DiffEditorProps } from "@monaco-editor/react";
import {
  MONACO_FONT_OPTIONS,
  MONACO_THEME_NAMES,
  defineMonacoThemes,
} from "../../Utils/monacoTheme";
import { useTheme } from "../DarkmodeOption";

/**
 * Monaco's diff editor with the console's Monaco theme and font, the ones CodeEditor uses.
 * PatternFly has no diff editor, so this sits next to CodeEditor.
 *
 * @prop {DiffEditorProps} props - Monaco's DiffEditor props, except the theme. Options are added
 *   on top of the font options.
 */
export const DiffEditor: React.FC<Omit<DiffEditorProps, "theme">> = ({
  options,
  beforeMount,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <ReactMonacoDiffEditor
      {...props}
      theme={MONACO_THEME_NAMES[theme]}
      options={{ ...MONACO_FONT_OPTIONS, ...options }}
      beforeMount={(monaco) => {
        defineMonacoThemes(monaco.editor);
        beforeMount?.(monaco);
      }}
    />
  );
};
