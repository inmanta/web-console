import React, { useContext, useEffect, useState } from "react";
import { DropdownItem, Text } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { ParsedNumber } from "@/Core";
import { useDeleteInstance } from "@/Data/Managers/V2/DELETE/DeleteInstance";
import { DependencyContext, words } from "@/UI";
import { ConfirmationModal, ToastAlertMessage } from "../../Util";

interface Props {
  isDisabled: boolean;
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DeleteAction: React.FC<Props> = ({
  isDisabled,
  service_entity,
  instance_display_identity,
  instance_id,
  version,
  onClose,
  setInterfaceBlocked,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const { environmentHandler } = useContext(DependencyContext);

  const environment = environmentHandler.useId();

  const { mutate, isError, error, isSuccess } = useDeleteInstance(
    environment,
    instance_id,
    service_entity,
    version,
  );

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onDeleteSelect = () => {
    setInterfaceBlocked(true);

    handleModalToggle();
  };

  const onSubmitDelete = () => {
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

  useEffect(() => {
    console.log("The query was successfull : ", isSuccess);
  }, [isError, isSuccess]);

  return (
    <>
      <DropdownItem
        isDisabled={isDisabled}
        isDanger
        key={"delete"}
        icon={<TrashAltIcon />}
        onClick={() => onDeleteSelect()}
      >
        {words("inventory.deleteInstance.button")}
      </DropdownItem>
      <ConfirmationModal
        title={words("inventory.deleteInstance.title")}
        onConfirm={onSubmitDelete}
        id={instance_display_identity}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setErrorMessage={setErrorMessage}
      >
        <Text>
          {words("inventory.deleteInstance.header")(
            instance_display_identity,
            service_entity,
          )}
        </Text>
        <br />
      </ConfirmationModal>
      {errorMessage && (
        <ToastAlertMessage
          message={errorMessage}
          id="error-toast-delete-instance"
          setMessage={setErrorMessage}
          variant="danger"
        />
      )}
    </>
  );
};
