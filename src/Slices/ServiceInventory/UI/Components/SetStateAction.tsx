import React, { useContext, useState } from "react";
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
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props extends VersionedServiceInstanceIdentifier {
  targets: string[] | null;
  instance_identity: string;
}

export const SetStateAction: React.FC<Props> = ({
  service_entity,
  id,
  instance_identity,
  version,
  targets,
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
    <DropdownItem key={target} value={target} data-testid={`${id}-${target}`}>
      {target}
    </DropdownItem>
  ));
  const isDisabled = !dropdownItems || dropdownItems.length === 0;
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const trigger = commandResolver.useGetTrigger<"TriggerSetState">({
    kind: "TriggerSetState",
    service_entity,
    id,
    version,
  });
  const isHalted = environmentModifier.useIsHalted();

  const onSubmit = async (targetState: string) => {
    const result = await trigger(targetState);
    if (Maybe.isSome(result)) {
      setStateErrorMessage(result.value);
    }
  };

  const onSelect = (event) => {
    setIsDropdownOpen(false);
    setTargetState(event.target.text);
    setConfirmationText(
      words("inventory.statustab.confirmMessage")(
        instance_identity,
        event.target.text
      )
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
      <ActionDisabledTooltip
        isDisabled={isDisabled || isHalted}
        ariaLabel={words("inventory.statustab.setInstanceState")}
        tooltipContent={
          isHalted
            ? words("environment.halt.tooltip")
            : words("inventory.statustab.actionDisabled")
        }
      >
        <Dropdown
          toggle={
            <DropdownToggle
              data-testid={`${id}-set-state-toggle`}
              onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
              toggleIndicator={CaretDownIcon}
              isDisabled={isDisabled || isHalted}
            >
              {words("inventory.statustab.setInstanceState")}
            </DropdownToggle>
          }
          dropdownItems={dropdownItems}
          isOpen={isDropdownOpen}
          onSelect={onSelect}
        />
      </ActionDisabledTooltip>
      <ConfirmationModal
        confirmationText={confirmationText}
        onSetInstanceState={onSubmit}
        id={id}
        targetState={targetState}
        isModalOpen={isModalOpen}
        setIsModalOpen={handleModalToggle}
        setErrorMessage={setStateErrorMessage}
      />
    </>
  );
};

interface ModalProps {
  confirmationText: string;
  id: string;
  targetState: string;
  onSetInstanceState: (targetState: string) => Promise<void>;
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
}) => {
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleConfirm = async () => {
    handleModalToggle();
    await onSetInstanceState(targetState);
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
