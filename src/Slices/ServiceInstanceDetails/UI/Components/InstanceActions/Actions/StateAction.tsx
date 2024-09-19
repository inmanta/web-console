import React, { useContext, useEffect, useState } from "react";
import { DropdownGroup, DropdownItem, Text } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { usePostStateTransfer } from "@/Data/Managers/V2/POST/PostStateTransfer/usePostStateTransfer";
import { DependencyContext, words } from "@/UI";
import { ConfirmationModal, ToastAlertMessage } from "../../Util";

interface Props {
  targets: string[];
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

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
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");

  const { environmentHandler, authHelper } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const { mutate, isError, error } = usePostStateTransfer(
    environment,
    instance_id,
    service_entity,
  );

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onSelect = (value: string) => {
    setTargetState(value);
    setConfirmationText(
      words("inventory.statustab.confirmMessage")(
        instance_display_identity,
        value,
      ),
    );
    handleModalToggle();
  };

  const onSubmit = () => {
    const username = authHelper.getUser();
    const message = words("instanceDetails.API.message.update")(username);

    mutate({
      message: message,
      current_version: version,
      target_state: targetState,
    });

    if (isError) {
      setStateErrorMessage(error.message);
    }

    onClose();
  };

  useEffect(() => {
    setInterfaceBlocked((prev: boolean) => {
      if (prev !== isModalOpen) {
        return isModalOpen;
      }

      return prev;
    });
  }, [isModalOpen, setInterfaceBlocked]);

  return (
    <>
      {stateErrorMessage && (
        <ToastAlertMessage
          message={stateErrorMessage}
          id={instance_display_identity}
          setMessage={setStateErrorMessage}
          variant="danger"
        />
      )}
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
        setIsModalOpen={handleModalToggle}
        setErrorMessage={setStateErrorMessage}
      >
        <Text>{confirmationText}</Text>
      </ConfirmationModal>
    </>
  );
};
