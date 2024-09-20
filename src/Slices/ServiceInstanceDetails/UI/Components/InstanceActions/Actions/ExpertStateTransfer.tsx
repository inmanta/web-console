import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  DropdownGroup,
  DropdownItem,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Text,
} from "@patternfly/react-core";
import { uniqueId } from "lodash";
import { ParsedNumber } from "@/Core";
import { usePostExpertStateTransfer } from "@/Data/Managers/V2/POST/PostExpertStateTransfer";
import { DependencyContext, words } from "@/UI";
import { ConfirmationModal } from "../../ConfirmModal";
import { ToastAlertMessage } from "../../ToastAllert";

interface Props {
  targets: string[];
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

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

  const expertStateOperations = [
    "clear candidate",
    "clear active",
    "clear rollback",
    "promote",
    "rollback",
  ];

  const { environmentHandler, authHelper } = useContext(DependencyContext);

  const environment = environmentHandler.useId();
  const username = authHelper.getUser();
  const message = words("instanceDetails.API.message.update")(username);

  const { mutate, isError, error } = usePostExpertStateTransfer(
    environment,
    instance_id,
    service_entity,
  );

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onStateSelect = (value: string) => {
    setInterfaceBlocked(true);
    setTargetState(value);
    handleModalToggle();
  };

  const onSubmitForceState = () => {
    mutate({
      message: message,
      current_version: version,
      target_state: targetState,
      ...(selectedOperation && { operation: selectedOperation }),
    });

    if (isError) {
      setErrorMessage(error.message);
    }

    onClose();
  };

  const onSelect = (value: string) => {
    setSelectedOperation(value);
  };

  useEffect(() => {
    setInterfaceBlocked((prev: boolean) => {
      if (prev !== isModalOpen) {
        return isModalOpen;
      }

      return prev;
    });
  }, [isModalOpen, setInterfaceBlocked]);

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
        setIsModalOpen={setIsModalOpen}
        setErrorMessage={setErrorMessage}
      >
        <Text>
          {words("instanceDetails.expert.confirm.state.message")(
            instance_display_identity,
            targetState,
          )}
        </Text>
        <br />
        <Form>
          <FormGroup label="Select an operation" fieldId="operation">
            <FormSelect
              id="operation-select"
              value={selectedOperation}
              onChange={(_event, value) => onSelect(value)}
            >
              <FormSelectOption key="no-op" label="No operation" />
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
