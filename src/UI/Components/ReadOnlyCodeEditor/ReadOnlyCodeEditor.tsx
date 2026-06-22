import React, { useState } from "react";
import { CodeEditor, CodeEditorProps } from "@patternfly/react-code-editor";
import { CodeEditorCopyControl, CodeEditorHeightToggleControl } from "../CodeEditorControls";
import { useTheme } from "../DarkmodeOption";
import { getDefaultHeightEditor } from "./helpers";

interface Props {
  value: string;
  language?: CodeEditorProps["language"];
}

/**
 * Read-only code editor with dark-theme, syntax highlighting, download, copy,
 * and an expand/collapse height toggle. Shows `value` verbatim — callers format
 * it. Pass `language` for highlighting and a label; omit it for generic content.
 *
 * @note Uses CodeEditorCopyControl (copy-to-clipboard) instead of the editor's
 * built-in copy, which relies on navigator.clipboard and breaks on http origins.
 */
export const ReadOnlyCodeEditor: React.FC<Props> = ({ value, language }) => {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const height = isExpanded ? "calc(100vh - 300px)" : getDefaultHeightEditor(value);

  return (
    <CodeEditor
      // Remount on toggle so Monaco re-layouts to the new height.
      key={String(isExpanded)}
      isReadOnly
      isDarkTheme={isDark}
      code={value}
      language={language}
      isLanguageLabelVisible={language !== undefined}
      isDownloadEnabled
      customControls={
        <>
          <CodeEditorCopyControl code={value} />
          <CodeEditorHeightToggleControl
            code={value}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
        </>
      }
      height={height}
    />
  );
};
