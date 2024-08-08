import React from "react";
import { Modal, ModalVariant, Button } from "@patternfly/react-core";
import { words } from "@/UI";

interface ModalProps {
  title: string;
  id: string;
  targetState: string;
  onSetInstanceState: (targetState: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  setErrorMessage: (message: string) => void;
  children: React.ReactNode | React.ReactNode[];
}

const ConfirmationModal: React.FC<ModalProps> = ({
  title,
  onSetInstanceState,
  isModalOpen,
  setIsModalOpen,
  id,
  targetState,
  children,
}) => {
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleConfirm = async () => {
    await onSetInstanceState(targetState);
    handleModalToggle();
  };

  return (
    <React.Fragment>
      <Modal
        disableFocusTrap
        data-testid={`${id}-state-modal`}
        variant={ModalVariant.small}
        titleIconVariant="danger"
        title={title}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            data-testid={`${id}-state-modal-confirm`}
            onClick={handleConfirm}
          >
            {words("yes")}
          </Button>,
          <Button
            key="cancel"
            variant="link"
            data-testid={`${id}-state-modal-cancel`}
            onClick={handleModalToggle}
          >
            {words("no")}
          </Button>,
        ]}
      >
        {children}
      </Modal>
    </React.Fragment>
  );
};
export default ConfirmationModal;
