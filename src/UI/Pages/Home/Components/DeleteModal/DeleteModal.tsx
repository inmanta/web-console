import React, { useContext, useState } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
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
      title={words("home.environment.delete.warning")}
      description={
        <ReactMarkdown>
          {words("home.environment.delete.warning.description.MD")(
            environment.name
          )}
        </ReactMarkdown>
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
      <Form>
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
              <ReactMarkdown>
                {words("home.environment.delete.warning.instruction.MD")(
                  environment.name
                )}
              </ReactMarkdown>
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
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

const CustomLabel = styled.p`
  font-weight: normal;
`;
