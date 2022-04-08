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
      variant="small"
      aria-label={`${actionType} environment modal`}
      title={words("home.environment.delete.warning")}
      description={
        actionType === "delete" ? (
          <p>
            This action cannot be undone. This will permanently delete the{" "}
            <b>{environment}</b> environment.
          </p>
        ) : (
          <p>
            This action cannot be undone. This will permanently remove
            everything from the <b>{environment}</b> environment and reset it to
            its initial state.
          </p>
        )
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
          Cancel
        </Button>,
      ]}
    >
      <Form onSubmit={onSubmit}>
        {errorMessage && (
          <FormAlert>
            <Alert
              variant="danger"
              title="Something went wrong"
              isInline
              aria-label="Environment Error Alert"
            >
              {errorMessage}
            </Alert>
          </FormAlert>
        )}
        <FormGroup
          label={
            <CustomLabel>
              Please type <b>{environment}</b> to confirm
            </CustomLabel>
          }
          type="text"
          fieldId="environmentName"
          validated={validated}
        >
          <TextInput
            id="environmentName"
            aria-label={`${actionType} environment check`}
            value={candidateEnv}
            validated={validated}
            onChange={setCandidateEnv}
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
