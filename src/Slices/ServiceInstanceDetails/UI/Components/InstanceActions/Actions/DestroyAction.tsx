import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

/**
 * The DestroyAction Component
 *
 * @props {Props} props - The props of the components
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {string} instance_id - the hashed id of the instance
 *  @prop {string} service_entity - the service entity type of the instance
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} onClose - callback method when the modal gets closed
 *  @prop {React.Dispatch<React.SetStateAction<boolean>>} setInterfaceBlocked - setState variable to block the interface when the modal is opened.
 *  This is meant to avoid clickEvents triggering the onOpenChange from the dropdown to shut down the modal.
 * @returns {React.FC<Props>} A React Component displaying the Destroy Dropdown Item
 */
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

  const navigate = useNavigate();

  const { environmentHandler, authHelper } = useContext(DependencyContext);

  const environment = environmentHandler.useId();
  const username = authHelper.getUser();
  const message = words("instanceDetails.API.message.update")(username);

  const { mutate, isError, error, isSuccess, isPending } = useDestroyInstance(
    environment,
    instance_id,
    service_entity,
    version,
    message,
  );

  const onDestroySelect = () => {
    setConfirmationText(
      words("inventory.destroyInstance.header")(
        instance_display_identity,
        service_entity,
      ),
    );
    setModalTitle(words("inventory.destroyInstance.title"));

    setInterfaceBlocked(true);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setInterfaceBlocked(false);
    onClose();
  }, [setIsModalOpen, setInterfaceBlocked, onClose]);

  const onSubmitDestroy = async () => {
    mutate("");
  };

  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }

    if (isSuccess) {
      navigate(
        `/console/lsm/catalog/${service_entity}/inventory?env=${environment}`,
      );
    }
  }, [isSuccess, isError, navigate, error, service_entity, environment]);

  return (
    <>
      <DropdownItem
        isDanger
        key="destroy"
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
        onCancel={closeModal}
        setErrorMessage={setErrorMessage}
        isPending={isPending}
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
