import React from "react";
import { Button, Spinner } from "@patternfly/react-core";
import { Modal, ModalVariant } from "@patternfly/react-core/deprecated";
import { words } from "@/UI";

interface Props {
  title: string;
  id: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isModalOpen: boolean;
  isPending: boolean;
  children: React.ReactNode | React.ReactNode[];
}

/**
 * ConfirmationModal component
 *
 * This component is close to being generic
 *
 * @props {Props} - The props of the component
 *  @prop {string} title - the title of the Modal
 *  @prop {string} id - the id of the Modal, this is reused in the test-ids
 *  @prop {Promise<void>} onConfirm - callback method when the Modal is confirmed
 *  @prop {function} onCancel - callback method when the Modal is closed without confirmation
 *  @prop {boolean} isModalOpen - whether the Modal should be open or not
 *  @prop {boolean} isPending - display a spinner in the YES button, and disable it
 *  @prop {React.FC} children - any additional content that needs to be displayed within the Modal
 * @returns {React.FC<Props>} A React Component displaying a modal to confirm a user action
 */
export const ConfirmationModal: React.FC<Props> = ({
  title,
  onConfirm,
  isModalOpen,
  isPending,
  onCancel,
  id,
  children,
}) => {
  const handleConfirm = async() => {
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
          {isPending && <Spinner size="sm" />}
        </Button>,
        <Button key="cancel" variant="link" data-testid={`${id}-modal-cancel`} onClick={onCancel}>
          {words("no")}
        </Button>,
      ]}
    >
      {children}
    </Modal>
  );
};
