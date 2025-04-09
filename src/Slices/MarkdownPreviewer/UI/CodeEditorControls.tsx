import React from "react";
import { CodeEditorControl } from "@patternfly/react-code-editor";
import { CopyIcon, DownloadIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

interface Props {
  code: string;
  service: string;
  instance: string;
}

/**
 * The CodeEditorControls Component
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} code - The markdown content
 *  @prop {string} service - The service name
 *  @prop {string} instance - The instance name
 * @returns {React.FC<Props>} A React Component that provides the controls for the CodeEditor.
 */
export const CodeEditorControls: React.FC<Props> = ({ code, service, instance }) => {
  return (
    <>
      <CodeEditorControl
        icon={<CopyIcon />}
        aria-label={words("copy")}
        tooltipProps={{ content: words("copy") }}
        onClick={() => {
          navigator.clipboard.writeText(code);
        }}
      />
      <CodeEditorControl
        icon={<DownloadIcon />}
        aria-label={words("markdownPreviewer.download")}
        tooltipProps={{ content: words("markdownPreviewer.download.tooltip") }}
        onClick={() => {
          const blob = new Blob([code], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");

          a.href = url;
          a.download = `${service}-${instance}-documentation.md`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}
      />
    </>
  );
};
