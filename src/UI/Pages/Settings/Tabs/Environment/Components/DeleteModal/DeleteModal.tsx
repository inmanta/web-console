import React, { useContext, useState } from "react";
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
import { EnvironmentModel, Maybe } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";

interface Props {
  environment: Pick<EnvironmentModel, "id" | "name">;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * @TODO Replace content once we support markdown in the words module
 */
export const DeleteModal: React.FC<Props> = ({
  environment,
  isOpen,
  onClose,
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const navigateTo = useNavigateTo();
  const redirectToHome = () => navigateTo("Home", undefined);
  const [candidateEnv, setCandidateEnv] = useState("");
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isBusy, setIsBusy] = useState(false);
  const trigger = commandResolver.getTrigger<"DeleteEnvironment">({
    kind: "DeleteEnvironment",
    id: environment.id,
  });
  const validated = environment.name === candidateEnv ? "success" : "default";

  const onCloseWithClear = () => {
    setCandidateEnv("");
    onClose();
  };

  const onDelete = async () => {
    setIsBusy(true);
    setErrorMessage(null);
    const error = await trigger();
    if (Maybe.isNone(error)) {
      onClose();
      redirectToHome();
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
      aria-label="Delete Environment Modal"
      title={words("home.environment.delete.warning")}
      description={
        <p>
          This action cannot be undone. This will permanently delete the{" "}
          <b>{environment.name}</b> environment.
        </p>
      }
      titleIconVariant="danger"
      isOpen={isOpen}
      onClose={onCloseWithClear}
      actions={[
        <Button
          aria-label="Delete"
          key="confirm"
          variant="danger"
          onClick={onDelete}
          isDisabled={validated !== "success" || isBusy}
        >
          {words("home.environment.delete.warning.action")}
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
              Please type <b>{environment.name}</b> to confirm
            </CustomLabel>
          }
          type="text"
          fieldId="environmentName"
          validated={validated}
        >
          <TextInput
            id="environmentName"
            aria-label="Delete Environment Check"
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
