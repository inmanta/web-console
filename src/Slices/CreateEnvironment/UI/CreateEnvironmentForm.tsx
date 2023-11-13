import React, { useContext, useState } from "react";
import { Button, Flex, FlexItem, Form } from "@patternfly/react-core";
import styled from "styled-components";
import { Either, ProjectModel } from "@/Core";
import { CreatableSelectInput, InlinePlainAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { CreateEnvironmentParams } from "@S/CreateEnvironment/Core/CreateEnvironmentCommand";
import { ImageField } from "./ImageField";
import { TextAreaField } from "./TextAreaField";
import { TextField } from "./TextField";

interface Props {
  projects: ProjectModel[];
}

export const CreateEnvironmentForm: React.FC<Props> = ({
  projects,
  ...props
}) => {
  const { commandResolver, featureManager } = useContext(DependencyContext);
  const isLsmEnabled = featureManager.isLsmEnabled();
  const navigateTo = useNavigateTo();
  const navigateToHome = () => navigateTo("Home", undefined);
  const createProject = commandResolver.useGetTrigger<"CreateProject">({
    kind: "CreateProject",
  });
  const createEnvironment = commandResolver.useGetTrigger<"CreateEnvironment">({
    kind: "CreateEnvironment",
  });
  const [createEnvironmentBody, setCreateEnvironmentBody] =
    useState<CreateEnvironmentParams>({ project_id: "", name: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [projectName, setProjectName] = useState<string | null>("");
  const setName = (name: string) => {
    setCreateEnvironmentBody({ ...createEnvironmentBody, name });
  };
  const setDescription = (description: string) => {
    setCreateEnvironmentBody({
      ...createEnvironmentBody,
      description: description ? description : undefined,
    });
  };
  const setRepository = (repository: string) => {
    setCreateEnvironmentBody({
      ...createEnvironmentBody,
      repository: repository ? repository : undefined,
    });
  };
  const setBranch = (branch: string) => {
    setCreateEnvironmentBody({
      ...createEnvironmentBody,
      branch: branch ? branch : undefined,
    });
  };
  const setIcon = (icon: string) => {
    setCreateEnvironmentBody({
      ...createEnvironmentBody,
      icon: icon ? icon : undefined,
    });
  };

  const onSubmitCreate = async () => {
    if (projectName && createEnvironmentBody.name) {
      const matchingProject = projects.find(
        (project) => project.name === projectName,
      );
      if (matchingProject) {
        const fullBody = {
          ...createEnvironmentBody,
          project_id: matchingProject.id,
        };
        const result = await createEnvironment(fullBody);
        if (Either.isLeft(result)) {
          setErrorMessage(result.value);
        } else {
          const target = isLsmEnabled ? "Catalog" : "CompileReports";
          navigateTo(target, undefined, `?env=${result.value.data.id}`);
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
        withLabel
        label={words("createEnv.projectName")}
        value={projectName || ""}
        options={projects.map((project) => project.name)}
        onCreate={createProject}
        onSelect={setProjectName}
      />
      <TextField
        isRequired
        value={createEnvironmentBody.name}
        label={words("createEnv.name")}
        onChange={setName}
      />
      <TextAreaField
        value={createEnvironmentBody.description || ""}
        label={words("createEnv.description")}
        onChange={(_event, value) => setDescription(value)}
      />
      <TextField
        value={createEnvironmentBody.branch || ""}
        label={words("createEnv.branch")}
        onChange={setBranch}
      />
      <TextField
        value={createEnvironmentBody.repository || ""}
        label={words("createEnv.repository")}
        onChange={setRepository}
      />
      <ImageField
        value={createEnvironmentBody.icon || ""}
        label={words("createEnv.icon")}
        onChange={setIcon}
      />
      <FormControls
        onSubmit={onSubmitCreate}
        onCancel={navigateToHome}
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
