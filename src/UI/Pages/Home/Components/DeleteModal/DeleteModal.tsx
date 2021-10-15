import { EnvironmentModel, Maybe } from "@/Core";
import { DependencyContext } from "@/UI";
import { words } from "@/UI/words";
import { Alert, Button, Modal, TextInput } from "@patternfly/react-core";
import React, { useContext, useState } from "react";
import styled from "styled-components";

interface Props {
  environment: Pick<EnvironmentModel, "id" | "name">;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteModal: React.FC<Props> = ({
  environment,
  isOpen,
  onClose,
}) => {
  const { commandResolver } = useContext(DependencyContext);
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
    setIsBusy(false);
    if (Maybe.isNone(error)) {
      onClose();
    } else {
      setErrorMessage(error.value);
    }
  };

  return (
    <Modal
      variant="small"
      aria-label="Delete Environment Modal"
      title="Delete Environment"
      titleIconVariant="danger"
      isOpen={isOpen}
      onClose={onCloseWithClear}
      description={words("home.environment.delete.warning")}
      actions={[
        <Button
          key="confirm"
          variant="danger"
          onClick={onDelete}
          isDisabled={validated !== "success" || isBusy}
        >
          Delete
        </Button>,
        <Button key="cancel" variant="plain" onClick={onCloseWithClear}>
          Cancel
        </Button>,
      ]}
    >
      <EnvironmentName>{environment.name}</EnvironmentName>
      <TextInput
        aria-label="Delete Environment Check"
        value={candidateEnv}
        validated={validated}
        onChange={setCandidateEnv}
      />
      {errorMessage && (
        <Alert variant="danger" isInline title="Danger inline alert title">
          <p>{errorMessage}</p>
        </Alert>
      )}
    </Modal>
  );
};

const EnvironmentName = styled.p`
  padding-bottom: 8px;
  font-weight: bold;
`;
