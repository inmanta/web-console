import React from "react";
import { Modal, ModalVariant, Button } from "@patternfly/react-core";
import { words } from "@/UI";
import { Spinner } from "@/UI/Components";

interface ModalProps {
  title: string;
  id: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isModalOpen: boolean;
  isPending: boolean;
  setErrorMessage: (message: string) => void;
  children: React.ReactNode | React.ReactNode[];
}

export const ConfirmationModal: React.FC<ModalProps> = ({
  title,
  onConfirm,
  isModalOpen,
  isPending,
  onCancel,
  id,
  children,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      disableFocusTrap
      data-testid={`${id}-modal`}
      variant={ModalVariant.small}
      titleIconVariant="danger"
      title={title}
      aria-label="Confirm-Modal"
      isOpen={isModalOpen}
      onClose={onCancel}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          data-testid={`${id}-modal-confirm`}
          onClick={handleConfirm}
          isDisabled={isPending}
        >
          {words("yes")}
          {isPending && <Spinner variant="small" />}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          data-testid={`${id}-modal-cancel`}
          onClick={onCancel}
        >
          {words("no")}
        </Button>,
      ]}
    >
      {children}
    </Modal>
  );
};
