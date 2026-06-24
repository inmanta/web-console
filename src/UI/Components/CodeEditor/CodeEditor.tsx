import React, { useState } from "react";
import { CodeEditor as PFCodeEditor, CodeEditorProps } from "@patternfly/react-code-editor";
import { CodeEditorCopyControl, CodeEditorHeightToggleControl } from "../CodeEditorControls";
import { useTheme } from "../DarkmodeOption";
import { getAutoHeight } from "./helpers";

// PF props minus the ones we own (theme is internal; no ref — we're a plain FC).
type Props = Omit<CodeEditorProps, "isDarkTheme" | "ref">;

/**
 * Shared, console-wide code editor: a thin wrapper around the PatternFly (Monaco)
 * CodeEditor that applies our common preset — app theme, copy + download controls,
 * and content-sized height with an expand toggle. Read-only by default; pass
 * `isReadOnly={false}` + `onChange` to edit. All other PF props pass through.
 *
 * @note Two props deviate from PF's semantics:
 * - `isCopyEnabled` (default `true`) is *intercepted*, not forwarded: it toggles
 *   our http-safe {@link CodeEditorCopyControl} instead of PF's built-in copy,
 *   which relies on `navigator.clipboard` and breaks on http origins.
 * - `isDownloadEnabled` defaults to `true` here (PF defaults it to `false`).
 */
export const CodeEditor: React.FC<Props> = ({
  code = "",
  language,
  height,
  isReadOnly = true,
  isDownloadEnabled = true,
  isCopyEnabled = true,
  isLanguageLabelVisible,
  ...rest
}) => {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Without an explicit height, size the editor to its content and offer an
  // expand/collapse toggle. An explicit height fixes the size and drops the toggle.
  const isAutoHeight = height === undefined;
  const resolvedHeight = isAutoHeight ? getAutoHeight(code, isExpanded) : height;

  return (
    <PFCodeEditor
      // Remount on toggle so Monaco re-layouts to the new height.
      key={isAutoHeight ? String(isExpanded) : undefined}
      code={code}
      language={language}
      height={resolvedHeight}
      isReadOnly={isReadOnly}
      isDarkTheme={isDark}
      isDownloadEnabled={isDownloadEnabled}
      // Default to showing the label when a language is set; ?? keeps an explicit false.
      isLanguageLabelVisible={isLanguageLabelVisible ?? language !== undefined}
      customControls={
        <>
          {isCopyEnabled && <CodeEditorCopyControl code={code} />}
          {isAutoHeight && (
            <CodeEditorHeightToggleControl
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded(!isExpanded)}
            />
          )}
        </>
      }
      {...rest}
    />
  );
};
