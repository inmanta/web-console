import React, { useContext, useState } from "react";
import { Button, Flex, FlexItem, Form } from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { Environment, ProjectModel } from "@/Core";
import {
  useCreateEnvironment,
  useCreateProject,
  getEnvironmentsKey,
  GetEnvironmentPreviewKey,
  EnvironmentPreviewResponse,
} from "@/Data/Queries";
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

/**
 * Create Environment Form
 * @props {Props} props - Props
 * @prop {ProjectModel[]} projects - Projects
 *
 * @returns {React.FC<Props>} Create Environment Form
 */
export const CreateEnvironmentForm: React.FC<Props> = ({ projects, ...props }) => {
  const { orchestratorProvider, environmentHandler } = useContext(DependencyContext);
  const isLsmEnabled = orchestratorProvider.isLsmEnabled();
  const navigateTo = useNavigateTo();
  const navigateToHome = () => navigateTo("Home", undefined);
  const client = useQueryClient();
  const createProject = useCreateProject();

  const createEnvironment = useCreateEnvironment({
    onSuccess: (data) => {
      const dataUpdater = (previousData: { data: Environment[] | undefined }) => {
        const oldData = previousData?.data || [];
        return { data: [...oldData, data.data] };
      };

      //update the data in the cache to avoid crash after navigating to the new env
      client.setQueryData(getEnvironmentsKey.list([{ hasDetails: true }]), dataUpdater);
      client.setQueryData(getEnvironmentsKey.list([{ hasDetails: false }]), dataUpdater);
      client.setQueryData(
        GetEnvironmentPreviewKey.list(),
        (previousData: EnvironmentPreviewResponse) => {
            const newEnv = {
              id: data.data.id,
              name: data.data.name,
              halted: data.data.halted,
              isExpertMode: false,
            }

            previousData.data.environments.edges.push({
              node: newEnv,
            });

          const envsAsArray = previousData.data.environments.edges.map((edge) => edge.node);

          environmentHandler.setAllEnvironments(envsAsArray);
  
          return previousData
        }
      );

      client.refetchQueries({ queryKey: GetEnvironmentPreviewKey.list() });
      client.refetchQueries({ queryKey: getEnvironmentsKey.list([{ hasDetails: true }]) });
      client.refetchQueries({ queryKey: getEnvironmentsKey.list([{ hasDetails: false }]) });

      const target = isLsmEnabled ? "Catalog" : "DesiredState";

      navigateTo(target, undefined, `?env=${data.data.id}`);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const [createEnvironmentBody, setCreateEnvironmentBody] = useState<CreateEnvironmentParams>({
    project_id: "",
    name: "",
  });
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

  const onSubmitCreate = () => {
    if (projectName && createEnvironmentBody.name) {
      const matchingProject = projects.find((project) => project.name === projectName);

      if (matchingProject) {
        const fullBody = {
          ...createEnvironmentBody,
          project_id: matchingProject.id,
        };
        createEnvironment.mutate(fullBody);
      }
    }
  };

  const onCloseAlert = () => setErrorMessage("");

  return (
    <Form isWidthLimited aria-label={props["aria-label"]}>
      {errorMessage && (
        <InlinePlainAlert
          aria-label={"submit-error-message"}
          errorMessage={errorMessage}
          closeButtonAriaLabel={"submit-close-error"}
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
        isLoading={createEnvironment.isPending}
      />
    </Form>
  );
};

const FormControls: React.FC<{
  isSubmitDisabled?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ isSubmitDisabled, onSubmit, onCancel, isLoading }) => (
  <Flex direction={{ default: "row" }} rowGap={{ default: "rowGap2xl" }}>
    <FlexItem>
      <Button
        aria-label="submit"
        onClick={onSubmit}
        isDisabled={isSubmitDisabled}
        isLoading={isLoading}
      >
        {words("submit")}
      </Button>
    </FlexItem>
    <FlexItem>
      <Button aria-label="cancel" variant="link" onClick={onCancel}>
        {words("cancel")}
      </Button>
    </FlexItem>
  </Flex>
);
