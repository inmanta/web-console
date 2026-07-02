import React from "react";
import { CodeEditorControl } from "@patternfly/react-code-editor";
import { CopyIcon, OutlinedCopyIcon, ExpandIcon, CompressIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import { words } from "@/UI/words";

interface CopyControlProps {
  value: string;
}

interface RawCopyControlProps {
  rawValue: string;
}

interface HeightToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * The CodeEditorCopyControl Component
 *
 * @props {CopyControlProps} props - The props of the component.
 *  @prop {string} value - The code content
 *
 * @note We can't use the default copy control from the codeEditor component,
 * because it uses navigator.clipboard which is not available on http, only on secure origins.
 *
 * @returns {React.FC<CopyControlProps>} A React Component that provides the copy control for the CodeEditor.
 */
export const CodeEditorCopyControl: React.FC<CopyControlProps> = ({ value }) => {
  return (
    <CodeEditorControl
      icon={<CopyIcon />}
      aria-label={words("copy")}
      tooltipProps={{ content: words("copy") }}
      onClick={() => {
        copy(value);
      }}
    />
  );
};

/**
 * The CodeEditorRawCopyControl Component
 *
 * Copies the raw, un-prettified string value rather than the formatted code the
 * editor displays. Used for JSON attributes, whose stored value is a compact
 * single-line string that the console pretty-prints for readability.
 *
 * @props {RawCopyControlProps} props - The props of the component.
 *  @prop {string} rawValue - The raw string to copy
 *
 * @returns {React.FC<RawCopyControlProps>} A React Component that copies the raw value.
 */
export const CodeEditorRawCopyControl: React.FC<RawCopyControlProps> = ({ rawValue }) => {
  return (
    <CodeEditorControl
      icon={<OutlinedCopyIcon />}
      aria-label={words("copy.raw")}
      tooltipProps={{ content: words("copy.raw") }}
      onClick={() => {
        copy(rawValue);
      }}
    />
  );
};

/**
 * The CodeEditorHeightToggleControl Component
 *
 * @props {HeightToggleProps} props - The props of the component.
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
