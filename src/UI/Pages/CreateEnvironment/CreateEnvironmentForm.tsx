import { CreateEnvironmentParams, Maybe, ProjectModel } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import {
  Button,
  DescriptionList,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import {
  EditableMultiTextField,
  EditableTextField,
  InlineSelectOption,
} from "@/UI/Components";
import React, { useContext, useState } from "react";
import { InlinePlainAlert } from "@/UI/Components/InlineEditable/InlinePlainAlert";
import styled from "styled-components";

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
  const setProject = (projectName: string) => {
    const project = projects.find((project) => project.name === projectName);
    if (project) {
      setCreateEnvironmentBody({
        ...createEnvironmentBody,
        project_id: project.id,
      });
    }
  };
  const setEnvironmentName = async (name: string) => {
    setCreateEnvironmentBody({ ...createEnvironmentBody, name: name });
    return Maybe.none();
  };
  const setRepositorySettings = async (
    fields: Pick<CreateEnvironmentParams, "branch" | "repository">
  ) => {
    setCreateEnvironmentBody({
      ...createEnvironmentBody,
      repository: fields.repository,
      branch: fields.branch,
    });
    return Maybe.none();
  };
  const onSubmitCreate = async () => {
    if (createEnvironmentBody.project_id && createEnvironmentBody.name) {
      const result = await createEnvironment(createEnvironmentBody);
      if (Maybe.isSome(result)) {
        setErrorMessage(result.value);
      } else {
        handleRedirect();
      }
    }
  };
  const onCloseAlert = () => setErrorMessage("");
  const projectName = projects.find(
    (project) => project.id === createEnvironmentBody.project_id
  )?.name;
  return (
    <>
      {errorMessage && (
        <InlinePlainAlert
          aria-label={`submit-error-message`}
          errorMessage={errorMessage}
          closeButtonAriaLabel={`submit-close-error`}
          onCloseAlert={onCloseAlert}
        />
      )}
      <StyledList aria-label={props["aria-label"]}>
        <InlineSelectOption
          isRequired
          label={words("createEnv.projectName")}
          initialValue={projectName || ""}
          initiallyEditable
          options={projects.map((project) => project.name)}
          onCreate={createProject}
          onSubmit={setProject}
        />
        <EditableTextField
          isRequired
          initialValue={createEnvironmentBody.name}
          initiallyEditable
          label={words("settings.tabs.environment.name")}
          onSubmit={setEnvironmentName}
        />
        <EditableMultiTextField
          groupName={words("settings.tabs.environment.repoSettings")}
          initialValues={{
            repository: createEnvironmentBody.repository || "",
            branch: createEnvironmentBody.branch || "",
          }}
          onSubmit={setRepositorySettings}
        />
      </StyledList>

      <FormControls
        onSubmit={onSubmitCreate}
        onCancel={handleRedirect}
        isSubmitDisabled={
          !(createEnvironmentBody.project_id && createEnvironmentBody.name)
        }
      />
    </>
  );
};

const StyledList = styled(DescriptionList)`
  --pf-c-description-list--RowGap: 0.5rem;
`;

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
