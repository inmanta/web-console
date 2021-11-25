import React, { useContext, useState } from "react";
import { Button, Flex, FlexItem, Form } from "@patternfly/react-core";
import styled from "styled-components";
import { CreateEnvironmentParams, Maybe, ProjectModel } from "@/Core";
import { InlinePlainAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { CreatableSelectInput } from "./CreatableSelectInput";
import { SimpleTextFormInput } from "./SimpleTextFormInput";

interface Props {
  projects: ProjectModel[];
}

export const CreateEnvironmentForm: React.FC<Props> = ({
  projects,
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
    if (projectName && createEnvironmentBody.name) {
      const matchingProject = projects.find(
        (project) => project.name === projectName
      );
      if (matchingProject) {
        const fullBody = {
          ...createEnvironmentBody,
          project_id: matchingProject.id,
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
  const preventDefault = (event: React.FormEvent) => {
    event.preventDefault();
  };
  return (
    <Form
      onSubmit={preventDefault}
      isWidthLimited
      aria-label={props["aria-label"]}
    >
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
        options={projects.map((project) => project.name)}
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
