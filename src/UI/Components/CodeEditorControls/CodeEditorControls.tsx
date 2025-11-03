import React from "react";
import { CodeEditorControl } from "@patternfly/react-code-editor";
import { CopyIcon, ExpandIcon, CompressIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import { words } from "@/UI/words";

interface CopyControlProps {
  code: string;
}

interface HeightToggleProps {
  code: string;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * The CodeEditorCopyControl Component
 *
 * @props {CopyControlProps} props - The props of the component.
 *  @prop {string} code - The code content
 *
 * @note We can't use the default copy control from the codeEditor component,
 * because it uses navigator.clipboard which is not available on http, only on secure origins.
 *
 * @returns {React.FC<CopyControlProps>} A React Component that provides the copy control for the CodeEditor.
 */
export const CodeEditorCopyControl: React.FC<CopyControlProps> = ({ code }) => {
  return (
    <CodeEditorControl
      icon={<CopyIcon />}
      aria-label={words("copy")}
      tooltipProps={{ content: words("copy") }}
      onClick={() => {
        copy(code);
      }}
    />
  );
};

/**
 * The CodeEditorHeightToggleControl Component
 *
 * @props {HeightToggleProps} props - The props of the component.
 *  @prop {string} code - The code content
 *  @prop {boolean} isExpanded - Whether the editor is currently expanded
 *  @prop {() => void} onToggle - Callback to toggle the height
 *
 * @returns {React.FC<HeightToggleProps>} A React Component that provides height toggle control for the CodeEditor.
 */
export const CodeEditorHeightToggleControl: React.FC<HeightToggleProps> = ({
  isExpanded,
  onToggle,
}) => {
  return (
    <CodeEditorControl
      icon={isExpanded ? <CompressIcon /> : <ExpandIcon />}
      aria-label={isExpanded ? "Collapse" : "Expand"}
      tooltipProps={{ content: isExpanded ? words("collapse") : words("expand") }}
      onClick={onToggle}
    />
  );
};
