import React, { useContext, useEffect, useState } from "react";
import { Alert, DropdownItem, Text } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { ParsedNumber } from "@/Core";
import { useDestroyInstance } from "@/Data/Managers/V2/DELETE/DestroyInstance/useDestroyInstance";
import { DependencyContext, words } from "@/UI";
import { ConfirmationModal } from "../../ConfirmModal";
import { ToastAlertMessage } from "../../ToastAllert";

interface Props {
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DestroyAction: React.FC<Props> = ({
  service_entity,
  instance_display_identity,
  instance_id,
  version,
  onClose,
  setInterfaceBlocked,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [confirmationText, setConfirmationText] = useState<string>("");
  const [modalTitle, setModalTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { environmentHandler, authHelper } = useContext(DependencyContext);

  const environment = environmentHandler.useId();
  const username = authHelper.getUser();
  const message = words("instanceDetails.API.message.update")(username);

  const { mutate, isError, error } = useDestroyInstance(
    environment,
    instance_id,
    service_entity,
    version,
    message,
  );

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onDestroySelect = () => {
    setInterfaceBlocked(true);
    setConfirmationText(
      words("inventory.destroyInstance.header")(
        instance_display_identity,
        service_entity,
      ),
    );
    setModalTitle(words("inventory.destroyInstance.title"));

    handleModalToggle();
  };

  const onSubmitDestroy = () => {
    mutate("");

    if (isError) {
      setErrorMessage(error.message);
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
      <DropdownItem
        isDanger
        key={"destroy"}
        icon={<TrashAltIcon />}
        onClick={() => onDestroySelect()}
      >
        {words("inventory.destroyInstance.button")}
      </DropdownItem>
      <ConfirmationModal
        title={modalTitle}
        onConfirm={onSubmitDestroy}
        id={instance_display_identity}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setErrorMessage={setErrorMessage}
      >
        <Text>{confirmationText}</Text>
        <br />
        <Alert
          variant="danger"
          title={words("instanceDetails.expert.confirm.warning")}
          isInline
        />
      </ConfirmationModal>
      {errorMessage && (
        <ToastAlertMessage
          message={errorMessage}
          id="error-toast-expert-destroy"
          setMessage={setErrorMessage}
          variant="danger"
        />
      )}
    </>
  );
};
