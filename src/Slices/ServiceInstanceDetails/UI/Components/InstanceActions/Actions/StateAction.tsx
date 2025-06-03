import React, { useCallback, useContext } from "react";
import {
  DropdownGroup,
  DropdownItem,
  Content,
  Button,
  Spinner,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { usePostStateTransfer } from "@/Data/Queries";
import { DependencyContext, words } from "@/UI";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

interface Props {
  targets: string[];
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
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
  setErrorMessage,
}) => {
  const { triggerModal } = useContext(ModalContext);

  /**
   * When a state is selected, block the interface, open the modal,
   * and set the selected state
   *
   * @param {string} value - the selected state
   */
  const onSelect = (value: string) => {
    triggerModal({
      title: words("instanceDetails.stateTransfer.confirmTitle"),
      content: (
        <ModalContent
          instance_id={instance_id}
          service_entity={service_entity}
          targetState={value}
          instance_display_identity={instance_display_identity}
          version={version}
          setErrorMessage={setErrorMessage}
          setInterfaceBlocked={setInterfaceBlocked}
        />
      ),
      iconVariant: "danger",
      cancelCb: () => {
        setInterfaceBlocked(false);
        onClose();
      },
    });
    setInterfaceBlocked(true);
  };

  return (
    <>
      <DropdownGroup label={words("instanceDetails.setState.label")}>
        {targets.map((target) => (
          <DropdownItem onClick={() => onSelect(target)} key={target}>
            {target}
          </DropdownItem>
        ))}
      </DropdownGroup>
    </>
  );
};

interface ModalContentProps {
  instance_id: string;
  service_entity: string;
  targetState: string;
  instance_display_identity: string;
  version: ParsedNumber;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * The ModalContent Component
 *
 * @props {ModalContentProps} props - The props of the components
 *  @prop {string} instance_id - the hashed id of the instance
 *  @prop {string} service_entity - the service entity type of the instance
 *  @prop {string} targetState - the target state to be set
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} setErrorMessage - callback method to set the error message
 *  @prop {function} setInterfaceBlocked - callback method to set the interface blocked
 * 
 * @returns {React.FC<ModalContentProps>} A React Component displaying the Modal Content
 */
const ModalContent: React.FC<ModalContentProps> = ({
  instance_id,
  service_entity,
  targetState,
  instance_display_identity,
  version,
  setErrorMessage,
  setInterfaceBlocked,
}) => {
  const { authHelper } = useContext(DependencyContext);
  const username = authHelper.getUser();

  const { closeModal } = useContext(ModalContext);

  const { mutate, isPending } = usePostStateTransfer(instance_id, service_entity, {
    onSuccess: () => {
      closeCallback();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  /**
   * async method sending out the request to update the state of the instance with selected state
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
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
  const closeCallback = useCallback(() => {
    closeModal();
    setInterfaceBlocked(false);
  }, [setInterfaceBlocked, closeModal]);

  return (
    <>
      <Content component="p">
        {words("inventory.statustab.confirmMessage")(instance_display_identity, targetState)}
      </Content>
      <br />
      <Flex>
        <FlexItem>
          <Button
            key="confirm"
            variant="primary"
            data-testid={`${instance_display_identity}-delete-modal-confirm`}
            onClick={onSubmit}
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
