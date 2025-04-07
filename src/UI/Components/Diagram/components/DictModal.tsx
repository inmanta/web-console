import React, { useContext, useState } from 'react';
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Modal,
  ModalBody,
  ModalHeader,
} from '@patternfly/react-core';
import { CanvasContext } from '../Context/Context';

/**
 * Modal to display the values of a dictionary.
 *
 * @note to be replaced by global modal in the future.
 *
 * @returns {React.FC} The DictModal component.
 */
export const DictModal: React.FC = () => {
  const { dictToDisplay, setDictToDisplay } = useContext(CanvasContext);
  const [copied, setCopied] = useState(false);

  return dictToDisplay !== null ? (
    <Modal
      disableFocusTrap
      isOpen={true}
      variant="medium"
      onClose={() => {
        setDictToDisplay(null);
      }}
    >
      <ModalHeader
        title={'Values of ' + dictToDisplay.title}
        labelId="dict-modal-title"
      />
      <ModalBody
        tabIndex={0}
        id="dict-modal-body"
        aria-label="Scrollable modal content"
      >
        {dictToDisplay && (
          <CodeBlock
            actions={
              <CodeBlockAction>
                <ClipboardCopyButton
                  id="basic-copy-button"
                  textId="copy-to-clipboard"
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
                    ? 'Successfully copied to clipboard!'
                    : 'Copy to clipboard'}
                </ClipboardCopyButton>
              </CodeBlockAction>
            }
          >
            <CodeBlockCode id="code-content">
              {JSON.stringify(dictToDisplay.value, null, 2)}
            </CodeBlockCode>
          </CodeBlock>
        )}
      </ModalBody>
    </Modal>
  ) : null;
};
