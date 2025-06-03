import React, { useContext, useEffect, useState } from "react";
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from "@patternfly/react-core";
import { words } from "@/UI";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { CanvasContext } from "../Context/Context";
import { DictDialogData } from "../interfaces";

/**
 * Modal to display the values of a dictionary.
 *
 * @note to be replaced by global modal in the future.
 *
 * @returns {React.FC} The DictModal component.
 */
export const DictModal: React.FC = () => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { dictToDisplay, setDictToDisplay } = useContext(CanvasContext);

  useEffect(() => {
    if (dictToDisplay) {
      triggerModal({
        title: words("instanceComposer.dictModal")(dictToDisplay.title),
        content: <ModalContent dictToDisplay={dictToDisplay} />,
        cancelCb: () => {
          closeModal();
          setDictToDisplay(null);
        },
      });
    }
  }, [dictToDisplay, triggerModal, closeModal, setDictToDisplay]);

  return null;
};

/**
 * The ModalContent Component
 *  @prop {DictDialogData} dictToDisplay - The dictionary to display
 * 
 * @returns {React.FC<ModalContentProps>} A React Component displaying the Modal Content
 */
const ModalContent: React.FC<{ dictToDisplay: DictDialogData }> = ({ dictToDisplay }) => {
  const [copied, setCopied] = useState(false);

  return (
    <CodeBlock
      actions={
        <CodeBlockAction>
          <ClipboardCopyButton
            id="basic-copy-button"
            textId="copy-to-clipboard"
            aria-label="Copy to clipboard"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(dictToDisplay.value))}
            exitDelay={copied ? 1500 : 600}
            maxWidth="110px"
            variant="plain"
            onTooltipHidden={() => setCopied(false)}
          >
            {copied ? "Successfully copied to clipboard!" : "Copy to clipboard"}
          </ClipboardCopyButton>
        </CodeBlockAction>
      }
    >
      <CodeBlockCode id="code-content">
        {JSON.stringify(dictToDisplay.value, null, 2)}
      </CodeBlockCode>
    </CodeBlock>
  );
};
