import React, { useContext, useState } from "react";
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Modal,
} from "@patternfly/react-core";
import { CanvasContext } from "../Context/Context";

/**
 * Modal to display the values of a dictionary.
 *
 * @returns {React.FC} The DictModal component.
 */
export const DictModal: React.FC = () => {
  const { dictToDisplay, setDictToDisplay } = useContext(CanvasContext);
  const [copied, setCopied] = useState(false);

  return (
    <Modal
      disableFocusTrap
      isOpen={dictToDisplay !== null}
      title={"Values of " + dictToDisplay?.title}
      variant="medium"
      onClose={() => {
        setDictToDisplay(null);
      }}
    >
      {dictToDisplay && (
        <CodeBlock
          actions={
            <CodeBlockAction>
              <ClipboardCopyButton
                id="basic-copy-button"
                textId="code-content"
                aria-label="Copy to clipboard"
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(dictToDisplay.value),
                  )
                }
                exitDelay={copied ? 1500 : 600}
                maxWidth="110px"
                variant="plain"
                onTooltipHidden={() => setCopied(false)}
              >
                {copied
                  ? "Successfully copied to clipboard!"
                  : "Copy to clipboard"}
              </ClipboardCopyButton>
            </CodeBlockAction>
          }
        >
          <CodeBlockCode id="code-content">
            {JSON.stringify(dictToDisplay.value, null, 2)}
          </CodeBlockCode>
        </CodeBlock>
      )}
    </Modal>
  );
};
