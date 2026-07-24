import React, { useCallback, useContext, useState } from "react";
import {
  Content,
  Button,
  Spinner,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  TextArea,
} from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { usePostStateTransfer } from "@/Data/Queries";
import { DependencyContext, words } from "@/UI";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

export interface StateTransferModalContentProps {
  instance_id: string;
  service_entity: string;
  targetState: string;
  instance_display_identity: string;
  version: ParsedNumber;
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
  setInterfaceBlocked,
}) => {
  const { authHelper } = useContext(DependencyContext);
  const username = authHelper.getUser();
  const { notifyError } = useAppAlert();
  const { closeModal } = useContext(ModalContext);
  const [message, setMessage] = useState<string>(
    words("instanceDetails.API.message.update")(username)
  );

  const { mutate, isPending } = usePostStateTransfer(instance_id, service_entity, {
    onSuccess: () => {
      closeCallback();
    },
    onError: (error) => {
      notifyError({
        title: error.message,
        testId: "error-toast-actions-error-message",
      });
    },
  });

  /**
   * async method sending out the request to update the state of the instance with selected state
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
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
      <Form>
        <FormGroup
          label={words("instanceDetails.stateTransfer.messageLabel")}
          fieldId="state-transfer-message"
        >
          <TextArea
            id="state-transfer-message"
            value={message}
            onChange={(_event, value) => setMessage(value)}
            aria-label="state-transfer-message-input"
            data-testid={`${instance_display_identity}-state-message`}
          />
        </FormGroup>
      </Form>
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
