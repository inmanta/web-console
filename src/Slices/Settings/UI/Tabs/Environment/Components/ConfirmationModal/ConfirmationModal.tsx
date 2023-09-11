import React, { useState } from "react";
import {
  Alert,
  Button,
  Form,
  FormAlert,
  FormGroup,
  Modal,
  TextInput,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Maybe } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  actionType: "delete" | "clear";
  environment: string;
  isOpen: boolean;
  onConfirm: () => Promise<Maybe.Type<string>>;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({
  actionType,
  environment,
  isOpen,
  onConfirm,
  onClose,
  onSuccess,
}) => {
  const [candidateEnv, setCandidateEnv] = useState("");
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isBusy, setIsBusy] = useState(false);
  const validated = environment === candidateEnv ? "success" : "default";

  const onCloseWithClear = () => {
    setCandidateEnv("");
    onClose();
  };
  const onCloseFullClear = () => {
    setCandidateEnv("");
    setIsBusy(false);
    onClose();
  };

  const onDelete = async () => {
    setIsBusy(true);
    setErrorMessage(null);
    const error = await onConfirm();
    if (Maybe.isNone(error)) {
      onSuccess ? onSuccess() : onCloseFullClear();
    } else {
      setIsBusy(false);
      setErrorMessage(error.value);
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validated !== "success" || isBusy) return;
    onDelete();
  };

  return (
    <Modal
      disableFocusTrap
      variant="small"
      aria-label={`${actionType} environment modal`}
      title={words("home.environment.delete.warning")}
      description={
        <p>
          {actionType === "delete"
            ? words("home.environment.delete.confirmation")(environment)
            : words("home.environment.clear.confirmation")(environment)}
        </p>
      }
      titleIconVariant="danger"
      isOpen={isOpen}
      onClose={onCloseWithClear}
      actions={[
        <Button
          aria-label={actionType}
          key="confirm"
          variant="danger"
          onClick={onDelete}
          isDisabled={validated !== "success" || isBusy}
        >
          {words(`home.environment.${actionType}.warning.action`)}
        </Button>,
        <Button key="cancel" variant="plain" onClick={onCloseWithClear}>
          {words("cancel")}
        </Button>,
      ]}
    >
      <Form onSubmit={onSubmit}>
        {errorMessage && (
          <FormAlert>
            <Alert variant="danger" title="Something went wrong" isInline>
              {errorMessage}
            </Alert>
          </FormAlert>
        )}
        <FormGroup
          label={
            <CustomLabel>
              {words("home.environment.promtInput")(environment)}
            </CustomLabel>
          }
          type="text"
          fieldId="environmentName"
        >
          <TextInput
            id="environmentName"
            aria-label={`${actionType} environment check`}
            value={candidateEnv}
            validated={validated}
            onChange={(_event, val) => setCandidateEnv(val)}
            autoFocus
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

const CustomLabel = styled.p`
  font-weight: normal;
`;
