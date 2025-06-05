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
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { FlatEnvironment } from "@/Core";
import { useClearEnvironment, useDeleteEnvironment, getEnvironmentsKey } from "@/Data/Queries";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { EnvActions } from "./Actions";

interface Props {
  environment: Pick<FlatEnvironment, "id" | "name">;
  type: EnvActions;
}

/**
 * ConfirmationForm component. This component renders a confirmation form for deleting or clearing an environment.
 *
 * @props {Props} props - The component props.
 * @prop {FlatEnvironment} environment - An object that represents the environment. It is a subset of the `FlatEnvironment` type, including only the `id` and `name` properties.
 * @prop {EnvActions} type- The type of action to perform.
 *
 * @returns {React.FC<Props>} - The rendered confirmation form.
 */
export const ConfirmationForm: React.FC<Props> = ({ environment, type }) => {
  const { closeModal } = useContext(ModalContext);
  const navigateTo = useNavigateTo();
  const client = useQueryClient();

  const [candidateEnv, setCandidateEnv] = useState("");
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isBusy, setIsBusy] = useState(false);
  const validated = environment.name === candidateEnv ? "success" : "default";

  const redirectToHome = () => navigateTo("Home", undefined);

  const deleteEnv = useDeleteEnvironment(environment.id, {
    onSuccess: () => {
      //reset the queries removes the cache which improves the ux when navigating back to the environments page,
      // without it the user won't see loading state and will see the old data for a split second and then removed env will be removed from the view
      client.resetQueries({ queryKey: getEnvironmentsKey.root() });

      closeModal();
      redirectToHome();
    },
    onError: (error) => {
      setErrorMessage(error.message);
      setIsBusy(false);
    },
  });

  const clearEnv = useClearEnvironment(environment.id, {
    onSuccess: () => {
      client.invalidateQueries({ queryKey: getEnvironmentsKey.root() });
      closeModal();
    },
    onError: (error) => {
      setErrorMessage(error.message);
      setIsBusy(false);
    },
  });

  /**
   * Handles the confirmation of the form based on the provided type.
   *
   * This function sets the component to a busy state, resets the error message, and triggers either a delete or clear operation based on the provided type.
   * If the operation is successful (i.e., the result is a `None` variant of a `Maybe`), it redirects to home (if the type is "delete") and closes the modal.
   * If the operation fails (i.e., the result is a `Some` variant of a `Maybe`), it sets the component to a non-busy state and sets the error message.
   *
   * @param {EnvActions} type - The type of operation to perform.
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onConfirm = async (type: EnvActions): Promise<void> => {
    setIsBusy(true);
    setErrorMessage(null);

    if (type === "delete") {
      deleteEnv.mutate();
    } else {
      clearEnv.mutate();
    }
  };

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
          <Alert data-testid="ErrorAlert" variant="danger" title={words("error")} isInline>
            {errorMessage}
          </Alert>
        </FormAlert>
      )}
      <FormGroup
        label={<CustomLabel>{words("home.environment.promptInput")(environment.name)}</CustomLabel>}
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
            <Button icon={words("cancel")} key="cancel" variant="plain" onClick={closeModal} />
          </FlexItem>
        </Flex>
      </ActionGroup>
    </Form>
  );
};

//font-weight is set to normal to remove default style for the input label to make only environment name bold
const CustomLabel = styled.p`
  font-weight: normal;
`;
