import React from "react";
import { CodeEditorControl } from "@patternfly/react-code-editor";
import { CopyIcon, DownloadIcon, CodeIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import { words } from "@/UI/words";

interface Props {
  code: string;
  service: string;
  instance: string;
}

/**
 * Handles the download of the markdown content as a file.
 *
 * @param {string} code - The markdown content to be downloaded
 * @param {string} service - The service name to be used in the filename
 * @param {string} instance - The instance name to be used in the filename
 * @returns {void}
 */
const handleDownload = (code: string, service: string, instance: string) => {
  const blob = new Blob([code], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `${service}-${instance}-documentation.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Escapes newlines in a string by replacing them with \n
 *
 * @param {string} text - The string to escape
 * @returns {string} The string with escaped newlines
 */
export const escapeNewlines = (text: string): string => {
  return text.replace(/\n/g, "\\n");
};

/**
 * The CodeEditorControls Component
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} code - The markdown content
 *  @prop {string} service - The service name
 *  @prop {string} instance - The instance name
 * @returns {React.FC<Props>} A React Component that provides the controls for the CodeEditor.
 */
export const MarkdownCodeEditorControls: React.FC<Props> = ({ code, service, instance }) => {
  return (
    <>
      <CodeEditorControl
        icon={<CopyIcon />}
        aria-label={words("copy")}
        tooltipProps={{ content: words("copy") }}
        onClick={() => {
          copy(code);
        }}
      />
      <CodeEditorControl
        icon={<CodeIcon />}
        aria-label={words("copy.raw")}
        tooltipProps={{ content: words("copy.raw.tooltip") }}
        onClick={() => {
          copy(escapeNewlines(code));
        }}
      />
      <CodeEditorControl
        icon={<DownloadIcon />}
        aria-label={words("markdownPreviewer.download")}
        tooltipProps={{ content: words("markdownPreviewer.download.tooltip") }}
        onClick={() => handleDownload(code, service, instance)}
      />
    </>
  );
};
