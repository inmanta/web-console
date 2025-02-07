import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  DropdownGroup,
  DropdownItem,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Content,
} from "@patternfly/react-core";
import { uniqueId } from "lodash";
import { ParsedNumber } from "@/Core";
import { usePostExpertStateTransfer } from "@/Data/Managers/V2/ServiceInstance";
import { DependencyContext, words } from "@/UI";
import { ConfirmationModal } from "../../ConfirmModal";
import { ToastAlertMessage } from "../../ToastAlert";

interface Props {
  targets: string[];
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
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
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [targetState, setTargetState] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedOperation, setSelectedOperation] = useState<string>();

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

  const { authHelper } = useContext(DependencyContext);

  const username = authHelper.getUser();
  const message = words("instanceDetails.API.message.update")(username);

  const { mutate, isError, error, isSuccess, isPending } =
    usePostExpertStateTransfer(instance_id, service_entity);

  /**
   * When a state is selected in the list, block the interface, open the modal,
   * and set the selected state target
   *
   * @param {string} value - selected state
   */
  const onStateSelect = (value: string) => {
    setInterfaceBlocked(true);
    setTargetState(value);
    setIsModalOpen(true);
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

  /**
   * update the state of the selected operation
   *
   * @param {string} value - selected operation
   */
  const onSelectOperation = (value: string) => {
    setSelectedOperation(value);
  };

  /**
   *  shorthand method to handle the state updates when the modal is closed
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setInterfaceBlocked(false);
    onClose();
  }, [setIsModalOpen, setInterfaceBlocked, onClose]);

  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }

    if (isSuccess) {
      closeModal();
    }
  }, [isError, isSuccess, error, closeModal]);

  return (
    <>
      <DropdownGroup label={words("instanceDetails.forceState.label")}>
        {targets.map((target) => (
          <DropdownItem
            isDanger
            onClick={() => onStateSelect(target)}
            key={uniqueId(target)}
          >
            {target}
          </DropdownItem>
        ))}
      </DropdownGroup>
      <ConfirmationModal
        title={words("inventory.statustab.confirmTitle")}
        onConfirm={onSubmitForceState}
        id={`Expert-State-Transfer-Confirmation-modal`}
        isModalOpen={isModalOpen}
        onCancel={closeModal}
        isPending={isPending}
      >
        <Content component="p">
          {words("instanceDetails.expert.confirm.state.message")(
            instance_display_identity,
            targetState,
          )}
        </Content>
        <br />
        <Form>
          <FormGroup
            label={words("instanceDetails.operation.selectLabel")}
            fieldId="operation"
          >
            <FormSelect
              id="operation-select"
              value={selectedOperation}
              onChange={(_event, value) => onSelectOperation(value)}
            >
              <FormSelectOption
                key="no-op"
                label={words("instanceDetails.state.noOperation")}
              />
              {expertStateOperations.map((operation, index) => (
                <FormSelectOption
                  key={index}
                  value={operation}
                  label={operation}
                />
              ))}
            </FormSelect>
          </FormGroup>
        </Form>
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
          id="error-toast-expert-state"
          setMessage={setErrorMessage}
          variant="danger"
        />
      )}
    </>
  );
};
