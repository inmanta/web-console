import React, { useState } from "react";
import {
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
  environment: string;
  onSetInstanceState:
    | ((id: string, targetState: string) => Promise<void>)
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
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const dropdownItems = targets?.map((target) => (
    <DropdownItem key={target}>{target}</DropdownItem>
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
      <Dropdown
        toggle={
          <DropdownToggle
            id={`${id}-set-state-toggle`}
            onToggle={() => setIsDropdownOpen(true)}
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
        />
      )}
    </>
  );
};

interface ModalProps {
  confirmationText: string;
  id: string;
  targetState: string;
  onSetInstanceState:
    | ((id: string, targetState: string) => Promise<void>)
    | null;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

const ConfirmationModal: React.FC<ModalProps> = ({
  confirmationText,
  onSetInstanceState,
  isModalOpen,
  setIsModalOpen,
  id,
  targetState,
}) => {
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleConfirm = async () => {
    handleModalToggle();
    if (onSetInstanceState) {
      await onSetInstanceState(id, targetState);
    }
  };

  return (
    <React.Fragment>
      <Modal
        variant={ModalVariant.small}
        title={words("inventory.statustab.confirmTitle")}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button key="confirm" variant="primary" onClick={handleConfirm}>
            {words("yes")}
          </Button>,
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            {words("no")}
          </Button>,
        ]}
      >
        {confirmationText}
      </Modal>
    </React.Fragment>
  );
};
