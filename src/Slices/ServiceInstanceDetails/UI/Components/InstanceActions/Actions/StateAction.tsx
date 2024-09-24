import React, { useCallback, useContext, useEffect, useState } from "react";
import { DropdownGroup, DropdownItem, Text } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { usePostStateTransfer } from "@/Data/Managers/V2/POST/PostStateTransfer/usePostStateTransfer";
import { DependencyContext, words } from "@/UI";
import { ConfirmationModal } from "../../ConfirmModal";
import { ToastAlertMessage } from "../../ToastAllert";

interface Props {
  targets: string[];
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * The StateTransfer Component
 *
 * @props {Props} props - The props of the components
 *  @prop {string[]} targets - a list of available states targets for the expert mode
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {string} instance_id - the hashed id of the instance
 *  @prop {string} service_entity - the service entity type of the instance
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} onClose - callback method when the modal gets closed
 *  @prop {React.Dispatch<React.SetStateAction<boolean>>} setInterfaceBlocked - setState variable to block the interface when the modal is opened.
 *  This is meant to avoid clickEvents triggering the onOpenChange from the dropdown to shut down the modal.
 * @returns {React.FC<Props>} A React Component displaying the State transfer Dropdown Item
 */
export const StateAction: React.FC<Props> = ({
  service_entity,
  instance_display_identity,
  instance_id,
  targets = [],
  version,
  onClose,
  setInterfaceBlocked,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [targetState, setTargetState] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { environmentHandler, authHelper } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const { mutate, isError, error, isSuccess, isPending } = usePostStateTransfer(
    environment,
    instance_id,
    service_entity,
  );

  /**
   * When a state is selected, block the interface, open the modal,
   * and set the selected state
   *
   * @param {string} value - the selected state
   */
  const onSelect = (value: string) => {
    setTargetState(value);
    setConfirmationText(
      words("inventory.statustab.confirmMessage")(
        instance_display_identity,
        value,
      ),
    );

    setInterfaceBlocked(true);
    setIsModalOpen(true);
  };

  /**
   * async method sending out the request to update the state of the instance with selected state
   */
  const onSubmit = async (): Promise<void> => {
    const username = authHelper.getUser();
    const message = words("instanceDetails.API.message.update")(username);

    mutate({
      message: message,
      current_version: version,
      target_state: targetState,
    });
  };

  /**
   *  shorthand method to handle the state updates when the modal is closed
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setInterfaceBlocked(false);
    onClose();
  }, [setInterfaceBlocked, setIsModalOpen, onClose]);

  useEffect(() => {
    if (isError && error) {
      setErrorMessage(error.message);
    }

    if (isSuccess) {
      closeModal();
    }
  }, [isError, isSuccess, error, closeModal]);

  return (
    <>
      <DropdownGroup label={words("instanceDetails.setState.label")}>
        {targets.map((target) => (
          <DropdownItem onClick={() => onSelect(target)} key={target}>
            {target}
          </DropdownItem>
        ))}
      </DropdownGroup>
      <ConfirmationModal
        title={words("instanceDetails.stateTransfer.confirmTitle")}
        onConfirm={onSubmit}
        id={instance_display_identity}
        isModalOpen={isModalOpen}
        onCancel={closeModal}
        setErrorMessage={setErrorMessage}
        isPending={isPending}
      >
        <Text>{confirmationText}</Text>
      </ConfirmationModal>
      {errorMessage && (
        <ToastAlertMessage
          message={errorMessage}
          id="error-toast-state-transfer"
          setMessage={setErrorMessage}
          variant="danger"
        />
      )}
    </>
  );
};
