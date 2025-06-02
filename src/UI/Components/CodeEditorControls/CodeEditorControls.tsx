import React from "react";
import { CodeEditorControl } from "@patternfly/react-code-editor";
import { CopyIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import { words } from "@/UI/words";

interface Props {
  code: string;
}

/**
 * The CodeEditorCopyControl Component
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} code - The code content
 *
 * @note We can't use the default copy control from the codeEditor component,
 * because it uses navigator.clipboard which is not available on http, only on secure origins.
 *
 * @returns {React.FC<Props>} A React Component that provides the copy control for the CodeEditor.
 */
export const CodeEditorCopyControl: React.FC<Props> = ({ code }) => {
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
