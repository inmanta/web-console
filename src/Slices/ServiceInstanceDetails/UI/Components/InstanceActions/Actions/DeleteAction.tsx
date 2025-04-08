import React, { useCallback, useState } from "react";
import { DropdownItem, Content } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { ParsedNumber } from "@/Core";
import { useDeleteInstance } from "@/Data/Managers/V2/ServiceInstance";
import { words } from "@/UI";
import { ConfirmationModal } from "../../ConfirmModal";
import { ToastAlertMessage } from "../../ToastAlert";

interface Props {
  isDisabled: boolean;
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * The DeleteAction Component
 *
 * @props {Props} props - The props of the components
 *  @prop {boolean} isDisabled - whether the menuItem should be disabled or not
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {string} instance_id - the hashed id of the instance
 *  @prop {string} service_entity - the service entity type of the instance
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} onClose - callback method when the modal gets closed
 *  @prop {React.Dispatch<React.SetStateAction<boolean>>} setInterfaceBlocked - setState variable to block the interface when the modal is opened.
 *  This is meant to avoid clickEvents triggering the onOpenChange from the dropdown to shut down the modal.
 * @returns {React.FC<Props>} A React Component displaying the Delete Dropdown Item
 */
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

  const { mutate, isPending } = useDeleteInstance(instance_id, service_entity, version, {
    onSuccess: () => {
      closeModal();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  /**
   *  When the delete action is selected, block the interface and open the modal
   */
  const onDeleteSelect = () => {
    setInterfaceBlocked(true);
    setIsModalOpen(true);
  };

  /**
   * async method sending out the request to delete the instance
   */
  const onSubmitDelete = async (): Promise<void> => {
    mutate();
  };

  /**
   * shorthand method to handle the state updates when the modal is closed
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setInterfaceBlocked(false);
    onClose();
  }, [setIsModalOpen, setInterfaceBlocked, onClose]);

  return (
    <>
      <DropdownItem
        isDisabled={isDisabled}
        isDanger
        key="delete"
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
        onCancel={closeModal}
        isPending={isPending}
      >
        <Content component="p">
          {words("inventory.deleteInstance.header")(instance_display_identity, service_entity)}
        </Content>
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
