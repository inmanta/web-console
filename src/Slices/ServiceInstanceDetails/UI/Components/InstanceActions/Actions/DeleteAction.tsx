import React, { useCallback, useContext } from "react";
import { DropdownItem, Content, Spinner, Button, Flex, FlexItem } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { ParsedNumber } from "@/Core";
import { useDeleteInstance } from "@/Data/Queries";
import { words } from "@/UI";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

interface Props {
  isDisabled: boolean;
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
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
  setErrorMessage,
}) => {
  const { triggerModal, closeModal } = useContext(ModalContext);

  /**
   *  When the delete action is selected, block the interface and open the modal
   */
  const onDeleteSelect = () => {
    setInterfaceBlocked(true);
    triggerModal({
      title: words("inventory.deleteInstance.title"),
      ariaLabel: `${instance_display_identity}-Delete-Modal`,
      dataTestId: `${instance_display_identity}-Delete-Modal`,
      iconVariant: "danger",
      cancelCb: closeCallback,
      content: (
        <ModalContent
          instance_id={instance_id}
          service_entity={service_entity}
          instance_display_identity={instance_display_identity}
          version={version}
          setErrorMessage={setErrorMessage}
          closeCallback={closeCallback}
        />
      ),
    });
  };

  /**
   * shorthand method to handle the state updates when the modal is closed
   */
  const closeCallback = useCallback(() => {
    closeModal();
    setInterfaceBlocked(false);
    onClose();
  }, [closeModal, setInterfaceBlocked, onClose]);

  return (
    <>
      <DropdownItem
        isDisabled={isDisabled}
        isDanger={!isDisabled} //when disabled the Danger styling overrides the disabled styling so button looks like is enabled
        key="delete"
        icon={<TrashAltIcon />}
        onClick={() => onDeleteSelect()}
      >
        {words("inventory.deleteInstance.button")}
      </DropdownItem>
    </>
  );
};

interface ModalContentProps {
  instance_id: string;
  service_entity: string;
  instance_display_identity: string;
  version: ParsedNumber;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  closeCallback: () => void;
}

/**
 * The ModalContent Component
 *
 * @props {ModalContentProps} props - The props of the components
 *  @prop {string} instance_id - the hashed id of the instance
 *  @prop {string} service_entity - the service entity type of the instance
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} setErrorMessage - callback method to set the error message
 *  @prop {function} closeCallback - callback method to close the modal
 * 
 * @returns {React.FC<ModalContentProps>} A React Component displaying the Modal Content
 */
const ModalContent: React.FC<ModalContentProps> = ({
  instance_id,
  service_entity,
  instance_display_identity,
  version,
  setErrorMessage,
  closeCallback,
}) => {
  const { mutate, isPending } = useDeleteInstance(instance_id, service_entity, version, {
    onSuccess: () => {
      closeCallback();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  /**
   * async method sending out the request to delete the instance
   */
  const onSubmitDelete = async (): Promise<void> => {
    mutate();
  };

  return (
    <>
      <Content component="p">
        {words("inventory.deleteInstance.header")(instance_display_identity, service_entity)}
      </Content>
      <br />

      <Flex>
        <FlexItem>
          <Button
            key="confirm"
            variant="primary"
            data-testid={`${instance_display_identity}-delete-modal-confirm`}
            onClick={onSubmitDelete}
            isDisabled={isPending}
          >
            {words("yes")}
            {isPending && <Spinner size="sm" />}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            key="cancel"
            variant="link"
            data-testid={`${instance_display_identity}-delete-modal-cancel`}
            onClick={closeCallback}
          >
            {words("no")}
          </Button>
        </FlexItem>
      </Flex>
    </>
  );
};
