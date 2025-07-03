import React, { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  DropdownGroup,
  DropdownItem,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Content,
  Spinner,
  Button,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { uniqueId } from "lodash";
import { ParsedNumber } from "@/Core";
import { usePostExpertStateTransfer } from "@/Data/Queries";
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
 * The ExpertStateTransfer Component
 *
 * @props {Props} props - The props of the components
 *  @prop {string[]} targets - a list of available states targets for the expert mode
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {string} instance_id - the UUID of the instance
 *  @prop {string} service_entity - the service entity type of the instance
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} onClose - callback method when the modal gets closed
 *  @prop {React.Dispatch<React.SetStateAction<boolean>>} setInterfaceBlocked - setState variable to block the interface when the modal is opened.
 *  This is meant to avoid clickEvents triggering the onOpenChange from the dropdown to shut down the modal.
 * @returns {React.FC<Props>} A React Component displaying the Expert State transfer Dropdown Item
 */
export const ExpertStateTransfer: React.FC<Props> = ({
  service_entity,
  instance_display_identity,
  instance_id,
  targets = [],
  version,
  onClose,
  setInterfaceBlocked,
  setErrorMessage,
}) => {
  const { triggerModal, closeModal } = useContext(ModalContext);

  /**
   * When a state is selected in the list, block the interface, open the modal,
   * and set the selected state target
   *
   * @param {string} value - selected state
   */
  const onStateSelect = (value: string) => {
    setInterfaceBlocked(true);
    triggerModal({
      title: words("instanceDetails.stateTransfer.confirmTitle"),
      content: (
        <ModalContent
          instance_id={instance_id}
          service_entity={service_entity}
          targetState={value}
          instance_display_identity={instance_display_identity}
          version={version}
          value={value}
          setErrorMessage={setErrorMessage}
          closeModalCallback={closeModalCallback}
        />
      ),
      iconVariant: "danger",
      cancelCb: closeModalCallback,
    });
  };

  /**
   *  shorthand method to handle the state updates when the modal is closed
   */
  const closeModalCallback = useCallback(() => {
    closeModal();
    setInterfaceBlocked(false);
    onClose();
  }, [closeModal, setInterfaceBlocked, onClose]);

  return (
    <>
      <DropdownGroup label={words("instanceDetails.forceState.label")}>
        {targets.map((target) => (
          <DropdownItem isDanger onClick={() => onStateSelect(target)} key={uniqueId(target)}>
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
  value: string;
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
 *  @prop {string} targetState - the target state to be set
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {string} value - the value of the state to be set
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} setErrorMessage - callback method to set the error message
 *
 * @returns {React.FC<ModalContentProps>} A React Component displaying the Modal Content
 */
const ModalContent: React.FC<ModalContentProps> = ({
  instance_id,
  service_entity,
  targetState,
  instance_display_identity,
  value,
  version,
  setErrorMessage,
  closeModalCallback,
}) => {
  const { authHelper } = useContext(DependencyContext);

  const username = authHelper.getUser();
  const message = words("instanceDetails.API.message.update")(username);

  const { mutate, isError, error, isSuccess, isPending } = usePostExpertStateTransfer(
    instance_id,
    service_entity
  );

  /**
   * The available expert state operation allowed by the Backend.
   */
  const expertStateOperations = [
    "clear candidate",
    "clear active",
    "clear rollback",
    "promote",
    "rollback",
  ];

  const [selectedOperation, setSelectedOperation] = useState<string>("");

  const onSelectOperation = (_event: FormEvent<HTMLSelectElement>, value: string) => {
    setSelectedOperation(value);
  };

  /**
   * async method sending out the request to force update the state of the instance
   */
  const onSubmitForceState = async (): Promise<void> => {
    mutate({
      message: message,
      current_version: version,
      target_state: targetState,
      ...(selectedOperation && { operation: selectedOperation }),
    });
  };

  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }

    if (isSuccess) {
      closeModalCallback();
    }
  }, [isError, isSuccess, error, closeModalCallback, setErrorMessage]);

  return (
    <>
      <Content component="p">
        {words("inventory.statustab.confirmMessage")(instance_display_identity, value)}
      </Content>
      <br />
      <Form>
        <FormGroup label={words("instanceDetails.operation.selectLabel")} fieldId="operation">
          <FormSelect id="operation-select" value={selectedOperation} onChange={onSelectOperation}>
            <FormSelectOption key="no-op" label={words("instanceDetails.state.noOperation")} />
            {expertStateOperations.map((operation, index) => (
              <FormSelectOption key={index} value={operation} label={operation} />
            ))}
          </FormSelect>
        </FormGroup>
      </Form>
      <br />
      <Alert variant="danger" title={words("instanceDetails.expert.confirm.warning")} isInline />
      <br />
      <Flex>
        <FlexItem>
          <Button
            key="confirm"
            variant="primary"
            data-testid={`${instance_display_identity}-delete-modal-confirm`}
            onClick={onSubmitForceState}
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
            onClick={closeModalCallback}
          >
            {words("no")}
          </Button>
        </FlexItem>
      </Flex>
    </>
  );
};
