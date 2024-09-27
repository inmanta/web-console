import React, { useContext, useState } from "react";
import {
  ActionGroup,
  Alert,
  Button,
  Flex,
  FlexItem,
  Form,
  FormAlert,
  FormGroup,
  TextInput,
} from "@patternfly/react-core";
import styled from "styled-components";
import { FlatEnvironment, Maybe } from "@/Core";
import { DependencyContext, useNavigateTo } from "@/UI";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";

interface Props {
  environment: Pick<FlatEnvironment, "id" | "name">;
  type: "delete" | "clear";
}
export const ConfirmationForm: React.FC<Props> = ({ environment, type }) => {
  const { commandResolver } = useContext(DependencyContext);
  const { closeModal } = useContext(ModalContext);
  const navigateTo = useNavigateTo();

  const [candidateEnv, setCandidateEnv] = useState("");
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isBusy, setIsBusy] = useState(false);
  const validated = environment.name === candidateEnv ? "success" : "default";

  const redirectToHome = () => navigateTo("Home", undefined);
  const deleteTrigger = commandResolver.useGetTrigger<"DeleteEnvironment">({
    kind: "DeleteEnvironment",
    id: environment.id,
  });
  const clearTrigger = commandResolver.useGetTrigger<"ClearEnvironment">({
    kind: "ClearEnvironment",
    id: environment.id,
  });

  async function onConfirm(type: "delete" | "clear") {
    setIsBusy(true);
    setErrorMessage(null);
    const error =
      type === "delete" ? await deleteTrigger() : await clearTrigger();

    if (Maybe.isNone(error)) {
      if (type === "delete") {
        redirectToHome();
      }
      closeModal();
    } else {
      setIsBusy(false);
      setErrorMessage(error.value);
    }
  }

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        if (validated !== "success" || isBusy) return;
        onConfirm(type);
      }}
    >
      {errorMessage && (
        <FormAlert>
          <Alert
            data-testid="ErrorAlert"
            variant="danger"
            title="Something went wrong"
            isInline
          >
            {errorMessage}
          </Alert>
        </FormAlert>
      )}
      <FormGroup
        label={
          <CustomLabel>
            {words("home.environment.promptInput")(environment.name)}
          </CustomLabel>
        }
        type="text"
        fieldId="environmentName"
      >
        <TextInput
          id="environmentName"
          aria-label={`${type} environment check`}
          value={candidateEnv}
          validated={validated}
          onChange={(_event, val) => setCandidateEnv(val)}
          autoFocus
        />
      </FormGroup>
      <ActionGroup>
        <Flex flexWrap={{ default: "nowrap" }} gap={{ default: "gapSm" }}>
          <FlexItem>
            <Button
              aria-label={type}
              key="confirm"
              variant="danger"
              onClick={() => onConfirm(type)}
              isDisabled={validated !== "success" || isBusy}
            >
              {words(`home.environment.${type}.warning.action`)}
            </Button>
          </FlexItem>

          <FlexItem>
            <Button key="cancel" variant="plain" onClick={closeModal}>
              {words("cancel")}
            </Button>
          </FlexItem>
        </Flex>
      </ActionGroup>
    </Form>
  );
};

const CustomLabel = styled.p`
  font-weight: normal;
`;
