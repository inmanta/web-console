import React, { useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Modal,
  ModalVariant,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import { words } from "@/UI";

interface Props {
  id: string;
  targets?: string[] | null;
  onSetInstanceState:
    | ((
        id: string,
        targetState: string,
        setErrorMessage: (message: string) => void
      ) => Promise<void>)
    | null;
}

export const SetStateAction: React.FC<Props> = ({
  id,
  targets,
  onSetInstanceState,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [targetState, setTargetState] = useState<string>("");
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const dropdownItems = targets?.map((target) => (
    <DropdownItem key={target} data-testid={`${id}-${target}`}>
      {target}
    </DropdownItem>
  ));

  const onSelect = (event) => {
    setIsDropdownOpen(false);
    setTargetState(event.currentTarget.innerText);
    setConfirmationText(
      words("inventory.statustab.confirmMessage")
        .replace("${id}", id)
        .replace("${state}", event.currentTarget.innerText)
    );
    handleModalToggle();
  };

  return (
    <>
      {stateErrorMessage && (
        <ToastAlertMessage
          stateErrorMessage={stateErrorMessage}
          id={id}
          setStateErrorMessage={setStateErrorMessage}
        />
      )}
      <Dropdown
        toggle={
          <DropdownToggle
            data-testid={`${id}-set-state-toggle`}
            onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            toggleIndicator={CaretDownIcon}
            isDisabled={!dropdownItems || dropdownItems.length === 0}
          >
            {words("inventory.statustab.setInstanceState")}
          </DropdownToggle>
        }
        dropdownItems={dropdownItems}
        isOpen={isDropdownOpen}
        onSelect={onSelect}
      />
      {onSetInstanceState && (
        <ConfirmationModal
          confirmationText={confirmationText}
          onSetInstanceState={onSetInstanceState}
          id={id}
          targetState={targetState}
          isModalOpen={isModalOpen}
          setIsModalOpen={handleModalToggle}
          setErrorMessage={setStateErrorMessage}
        />
      )}
    </>
  );
};

interface ModalProps {
  confirmationText: string;
  id: string;
  targetState: string;
  onSetInstanceState: (
    id: string,
    targetState: string,
    setErrorMessage: (message: string) => void
  ) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  setErrorMessage: (message: string) => void;
}

const ConfirmationModal: React.FC<ModalProps> = ({
  confirmationText,
  onSetInstanceState,
  isModalOpen,
  setIsModalOpen,
  id,
  targetState,
  setErrorMessage,
}) => {
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleConfirm = async () => {
    handleModalToggle();
    await onSetInstanceState(id, targetState, setErrorMessage);
  };

  return (
    <React.Fragment>
      <Modal
        data-testid={`${id}-set-state-modal`}
        variant={ModalVariant.small}
        title={words("inventory.statustab.confirmTitle")}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            data-testid={`${id}-set-state-modal-confirm`}
            onClick={handleConfirm}
          >
            {words("yes")}
          </Button>,
          <Button
            key="cancel"
            variant="link"
            data-testid={`${id}-set-state-modal-cancel`}
            onClick={handleModalToggle}
          >
            {words("no")}
          </Button>,
        ]}
      >
        {confirmationText}
      </Modal>
    </React.Fragment>
  );
};

interface ToastAlertMessageProps {
  stateErrorMessage: string;
  id: string;
  setStateErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ToastAlertMessage: React.FC<ToastAlertMessageProps> = ({
  stateErrorMessage,
  id,
  setStateErrorMessage,
}) => {
  return (
    <AlertGroup isToast={true}>
      <Alert
        variant="danger"
        title={stateErrorMessage}
        data-testid={`${id}-error-message`}
        actionClose={
          <AlertActionCloseButton
            data-testid={`${id}-close-error-message`}
            onClose={() => setStateErrorMessage("")}
          />
        }
      />
    </AlertGroup>
  );
};
