import React, { useCallback, useContext } from "react";
import { Content, Button, Spinner, Flex, FlexItem } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { usePostStateTransfer } from "@/Data/Queries";
import { DependencyContext, words } from "@/UI";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

export interface StateTransferModalContentProps {
  instance_id: string;
  service_entity: string;
  targetState: string;
  instance_display_identity: string;
  version: ParsedNumber;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Shared modal content used to confirm and execute a state transfer.
 */
export const StateTransferModalContent: React.FC<StateTransferModalContentProps> = ({
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
