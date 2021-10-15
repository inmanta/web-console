import { EnvironmentModel, Maybe } from "@/Core";
import { DependencyContext } from "@/UI";
import { words } from "@/UI/words";
import {
  Alert,
  Button,
  Form,
  FormAlert,
  FormGroup,
  Modal,
  TextInput,
} from "@patternfly/react-core";
import { TagIcon } from "@patternfly/react-icons";
import React, { useContext, useState } from "react";

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
      <Form>
        <EnvironmentName name={environment.name} />
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
          label="Environment Name"
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
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

const EnvironmentName: React.FC<{ name: string }> = ({ name }) => (
  <p>
    <TagIcon /> <b>{name}</b>
  </p>
);
