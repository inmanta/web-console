import { CreateEnvironmentParams, FlatEnvironment, Maybe } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Button, Flex, FlexItem, Form } from "@patternfly/react-core";
import React, { useContext, useState } from "react";
import { InlinePlainAlert } from "@/UI/Components";
import styled from "styled-components";
import { CreatableSelectInput } from "./CreatableSelectInput";
import { SimpleTextFormInput } from "./SimpleTextFormInput";

interface Props {
  environments: FlatEnvironment[];
}

export const CreateEnvironmentForm: React.FC<Props> = ({
  environments,
  ...props
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const navigateTo = useNavigateTo();
  const handleRedirect = () => navigateTo("Home", undefined);
  const createProject = commandResolver.getTrigger<"CreateProject">({
    kind: "CreateProject",
  });
  const createEnvironment = commandResolver.getTrigger<"CreateEnvironment">({
    kind: "CreateEnvironment",
  });
  const [createEnvironmentBody, setCreateEnvironmentBody] =
    useState<CreateEnvironmentParams>({ project_id: "", name: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [projectName, setProjectName] = useState("");
  const setEnvironmentName = async (name: string) => {
    setCreateEnvironmentBody({ ...createEnvironmentBody, name });
    return Maybe.none();
  };
  const setRepository = async (repository: string) => {
    setCreateEnvironmentBody({ ...createEnvironmentBody, repository });
  };
  const setBranch = async (branch: string) => {
    setCreateEnvironmentBody({ ...createEnvironmentBody, branch });
  };

  const onSubmitCreate = async () => {
    console.log(projectName, createEnvironmentBody.name);
    if (projectName && createEnvironmentBody.name) {
      const flatEnv = environments.find(
        (env) => env.projectName === projectName
      );
      console.log(environments, flatEnv);
      if (flatEnv) {
        const fullBody = {
          ...createEnvironmentBody,
          project_id: flatEnv.project_id,
        };
        const result = await createEnvironment(fullBody);
        if (Maybe.isSome(result)) {
          setErrorMessage(result.value);
        } else {
          handleRedirect();
        }
      }
    }
  };
  const onCloseAlert = () => setErrorMessage("");
  return (
    <Form isWidthLimited aria-label={props["aria-label"]}>
      {errorMessage && (
        <InlinePlainAlert
          aria-label={`submit-error-message`}
          errorMessage={errorMessage}
          closeButtonAriaLabel={`submit-close-error`}
          onCloseAlert={onCloseAlert}
        />
      )}
      <CreatableSelectInput
        isRequired
        label={words("createEnv.projectName")}
        value={projectName || ""}
        options={Array.from(
          new Set(environments.map((env) => env.projectName))
        )}
        onCreate={createProject}
        onSelect={setProjectName}
      />
      <SimpleTextFormInput
        isRequired
        value={createEnvironmentBody.name}
        label={words("settings.tabs.environment.name")}
        onChange={setEnvironmentName}
      />
      <SimpleTextFormInput
        value={createEnvironmentBody.repository || ""}
        label={words("createEnv.repository")}
        onChange={setRepository}
      />
      <SimpleTextFormInput
        value={createEnvironmentBody.branch || ""}
        label={words("createEnv.branch")}
        onChange={setBranch}
      />
      <FormControls
        onSubmit={onSubmitCreate}
        onCancel={handleRedirect}
        isSubmitDisabled={!(projectName && createEnvironmentBody.name)}
      />
    </Form>
  );
};

const FormControls: React.FC<{
  isSubmitDisabled?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ isSubmitDisabled, onSubmit, onCancel }) => (
  <PaddedControls direction={{ default: "row" }}>
    <FlexItem>
      <Button
        aria-label="submit"
        onClick={onSubmit}
        isDisabled={isSubmitDisabled}
      >
        {words("submit")}
      </Button>
    </FlexItem>
    <FlexItem>
      <Button aria-label="cancel" variant="link" onClick={onCancel}>
        {words("cancel")}
      </Button>
    </FlexItem>
  </PaddedControls>
);

const PaddedControls = styled(Flex)`
  padding-top: 1em;
`;
