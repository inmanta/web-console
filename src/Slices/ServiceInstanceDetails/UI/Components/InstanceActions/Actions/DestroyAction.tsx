import React, { useCallback, useContext } from "react";
import { useNavigate } from "react-router";
import { DropdownItem, Content, Spinner, Button, Flex, FlexItem } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { ParsedNumber } from "@/Core";
import { useDestroyInstance } from "@/Data/Queries";
import { DependencyContext, words } from "@/UI";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

interface Props {
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
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
  setErrorMessage,
}) => {
  const { triggerModal, closeModal } = useContext(ModalContext);

  /**
   * When the destroy action is selected, block the interface and open the modal
   */
  const onDestroySelect = () => {
    setInterfaceBlocked(true);
    triggerModal({
      title: words("inventory.destroyInstance.title"),
      content: (
        <ModalContent
          instance_id={instance_id}
          service_entity={service_entity}
          instance_display_identity={instance_display_identity}
          version={version}
          setErrorMessage={setErrorMessage}
          closeModalCallback={closeModalCallback}
        />
      ),
      iconVariant: "danger",
    });
  };

  /**
   * shorthand method to handle the state updates when the modal is closed.
   */
  const closeModalCallback = useCallback(() => {
    closeModal();
    setInterfaceBlocked(false);
    onClose();
  }, [closeModal, setInterfaceBlocked, onClose]);

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
    </>
  );
};

interface ModalContentProps {
  instance_id: string;
  service_entity: string;
  instance_display_identity: string;
  version: ParsedNumber;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  closeModalCallback: () => void;
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
 *  @prop {function} closeModalCallback - callback method to close the modal
 *
 * @returns {React.FC<ModalContentProps>} A React Component displaying the Modal Content
 */
const ModalContent: React.FC<ModalContentProps> = ({
  instance_id,
  service_entity,
  instance_display_identity,
  version,
  setErrorMessage,
  closeModalCallback,
}) => {
  const navigate = useNavigate();

  const { environmentHandler, authHelper } = useContext(DependencyContext);

  const environment = environmentHandler.useId();
  const username = authHelper.getUser();
  const message = words("instanceDetails.API.message.update")(username);

  const { mutate, isPending } = useDestroyInstance(instance_id, service_entity, version, message, {
    onSuccess: () => {
      closeModalCallback();
      navigate(`/console/lsm/catalog/${service_entity}/inventory?env=${environment}`);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  /**
   * async method sending out the request to destroy the instance
   */
  const onSubmitDestroy = async (): Promise<void> => {
    mutate();
  };

  return (
    <>
      <Content component="p">
        {words("inventory.destroyInstance.header")(instance_display_identity, service_entity)}
      </Content>
      <br />
      <Flex>
        <FlexItem>
          <Button
            key="confirm"
            variant="primary"
            data-testid={`${instance_display_identity}-destroy-modal-confirm`}
            onClick={onSubmitDestroy}
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
            data-testid={`${instance_display_identity}-destroy-modal-cancel`}
            onClick={closeModalCallback}
          >
            {words("no")}
          </Button>
        </FlexItem>
      </Flex>
    </>
  );
};
