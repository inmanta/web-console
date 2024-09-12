import React from "react";
import { Modal, ModalVariant, Button } from "@patternfly/react-core";
import { words } from "@/UI";

interface ModalProps {
  title: string;
  id: string;
  onConfirm: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  setErrorMessage: (message: string) => void;
  children: React.ReactNode | React.ReactNode[];
}

export const ConfirmationModal: React.FC<ModalProps> = ({
  title,
  onConfirm,
  isModalOpen,
  setIsModalOpen,
  id,
  children,
}) => {
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleConfirm = async () => {
    await onConfirm();
    handleModalToggle();
  };

  return (
    <>
      <Modal
        disableFocusTrap
        data-testid={`${id}-modal`}
        variant={ModalVariant.small}
        titleIconVariant="danger"
        title={title}
        aria-label="Confirm-Modal"
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            data-testid={`${id}-modal-confirm`}
            onClick={handleConfirm}
          >
            {words("yes")}
          </Button>,
          <Button
            key="cancel"
            variant="link"
            data-testid={`${id}-modal-cancel`}
            onClick={handleModalToggle}
          >
            {words("no")}
          </Button>,
        ]}
      >
        {children}
      </Modal>
    </>
  );
};
