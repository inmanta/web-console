import { words } from "@/UI/words";
import { Button, ButtonProps, Modal } from "@patternfly/react-core";
import React, { useState } from "react";

interface Props {
  modalButton: React.ReactElement<ButtonProps>;
  modalContent: React.ReactNode;
  title: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationDialog: React.FC<Props> = ({
  modalButton,
  onConfirm,
  modalContent,
  title,
  confirmText = words("confirm"),
  cancelText = words("cancel"),
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => setIsModalOpen(!isModalOpen);
  modalButton.props.onClick;
  return (
    <React.Fragment>
      {React.cloneElement(modalButton, { onClick: handleModalToggle })}
      <Modal
        variant="small"
        title={title}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => {
              onConfirm();
              handleModalToggle();
            }}
          >
            {confirmText}
          </Button>,
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            {cancelText}
          </Button>,
        ]}
      >
        {modalContent}
      </Modal>
    </React.Fragment>
  );
};
