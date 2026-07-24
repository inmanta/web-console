import React, { useState } from "react";
import {
  Alert,
  Button,
  Content,
  Divider,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { FolderIcon, LockIcon } from "@patternfly/react-icons";
import { ProjectModel } from "@/Core";
import { useDeleteProject, useGetProjects } from "@/Data/Queries";
import { words } from "@/UI/words";

/**
 * Modal content for the "Manage projects" feature.
 * Fetches all projects with environment details and allows deletion of empty projects.
 */
export const ManageProjectsModal: React.FC = () => {
  const { data: projects, isLoading, isError, error } = useGetProjects().useOneTime(true);

  if (isLoading) {
    return (
      <Flex justifyContent={{ default: "justifyContentCenter" }}>
        <FlexItem>
          <Spinner size="lg" />
        </FlexItem>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert variant="danger" isInline title={words("error")}>
        {error?.message}
      </Alert>
    );
  }

  const projectList = projects ?? [];

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" isInline title={words("home.manageProjects.callout.title")}>
          {words("home.manageProjects.callout")}
          <strong>{words("home.manageProjects.callout.bold")}</strong>
          {words("home.manageProjects.callout.suffix")}
        </Alert>
      </StackItem>
      <StackItem>
        <Stack>
          {projectList.map((project, index) => (
            <React.Fragment key={project.id}>
              <StackItem style={{ paddingBlock: "var(--pf-t--global--spacer--md)" }}>
                <ProjectRow project={project} />
              </StackItem>
              {index < projectList.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Stack>
      </StackItem>
    </Stack>
  );
};

interface ProjectRowProps {
  project: ProjectModel;
}

type RowState = "idle" | "confirming";

const ProjectRow: React.FC<ProjectRowProps> = ({ project }) => {
  const [rowState, setRowState] = useState<RowState>("idle");
  const envCount = project.environments.length;
  const isDeletable = envCount === 0;

  const deleteProject = useDeleteProject(project.id);

  const handleDeleteClick = () => {
    setRowState("confirming");
  };

  const handleConfirm = () => {
    deleteProject.mutate();
  };

  const handleCancel = () => {
    setRowState("idle");
  };

  return (
    <Split hasGutter style={{ alignItems: "flex-start" }}>
      <SplitItem>
        <Flex
          justifyContent={{ default: "justifyContentCenter" }}
          alignItems={{ default: "alignItemsCenter" }}
          style={{
            width: "36px",
            height: "36px",
            border: "1px solid var(--pf-t--global--border--color--default)",
            borderRadius: "var(--pf-t--global--border--radius--small)",
            color: "var(--pf-t--global--icon--color--subtle)",
          }}
        >
          <FlexItem>
            <FolderIcon />
          </FlexItem>
        </Flex>
      </SplitItem>

      <SplitItem isFilled>
        <Stack>
          <StackItem>
            <strong>{project.name}</strong>
          </StackItem>
          <StackItem>
            <Flex
              spaceItems={{ default: "spaceItemsSm" }}
              alignItems={{ default: "alignItemsCenter" }}
            >
              <FlexItem>
                <Label isCompact variant="outline" color="grey">
                  {words("home.manageProjects.environments.count")(envCount)}
                </Label>
              </FlexItem>
              {envCount === 0 ? (
                <FlexItem>
                  <Content
                    style={{
                      color: "var(--pf-t--global--text--color--subtle)",
                      fontSize: "var(--pf-t--global--font--size--sm)",
                    }}
                  >
                    {words("home.manageProjects.environments.empty")}
                  </Content>
                </FlexItem>
              ) : (
                <FlexItem>
                  <LabelGroup numLabels={5}>
                    {project.environments.map((env) => (
                      <Label key={env.id} isCompact>
                        {env.name}
                      </Label>
                    ))}
                  </LabelGroup>
                </FlexItem>
              )}
            </Flex>
          </StackItem>
        </Stack>
      </SplitItem>

      <SplitItem>
        {rowState === "idle" ? (
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            spaceItems={{ default: "spaceItemsSm" }}
            flexWrap={{ default: "nowrap" }}
          >
            {!isDeletable && (
              <FlexItem>
                <Flex
                  alignItems={{ default: "alignItemsCenter" }}
                  spaceItems={{ default: "spaceItemsXs" }}
                >
                  <FlexItem>
                    <LockIcon color="var(--pf-t--global--icon--color--subtle)" />
                  </FlexItem>
                  <FlexItem>
                    <Content
                      style={{
                        color: "var(--pf-t--global--text--color--subtle)",
                        fontSize: "var(--pf-t--global--font--size--sm)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {words("home.manageProjects.environments.remain")(envCount)}
                    </Content>
                  </FlexItem>
                </Flex>
              </FlexItem>
            )}
            <FlexItem>
              <Button
                variant="danger"
                isDisabled={!isDeletable}
                onClick={handleDeleteClick}
                data-testid={`delete-project-${project.id}`}
              >
                {words("home.manageProjects.delete.button")}
              </Button>
            </FlexItem>
          </Flex>
        ) : (
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            spaceItems={{ default: "spaceItemsSm" }}
            flexWrap={{ default: "nowrap" }}
          >
            <FlexItem>
              <Content
                style={{
                  color: "var(--pf-t--global--text--color--subtle)",
                  fontSize: "var(--pf-t--global--font--size--sm)",
                  whiteSpace: "nowrap",
                }}
              >
                {words("home.manageProjects.delete.confirm.warning")}
              </Content>
            </FlexItem>
            <FlexItem>
              <Button
                variant="plain"
                onClick={handleCancel}
                data-testid={`cancel-delete-project-${project.id}`}
              >
                {words("home.manageProjects.delete.cancel.button")}
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant="danger"
                isLoading={deleteProject.isPending}
                isDisabled={deleteProject.isPending}
                onClick={handleConfirm}
                data-testid={`confirm-delete-project-${project.id}`}
              >
                {words("home.manageProjects.delete.confirm.button")}
              </Button>
            </FlexItem>
          </Flex>
        )}
        {deleteProject.isError && (
          <Flex style={{ marginBlockStart: "var(--pf-t--global--spacer--xs)" }}>
            <FlexItem>
              <Content
                style={{
                  color: "var(--pf-t--global--color--status--danger--default)",
                  fontSize: "var(--pf-t--global--font--size--sm)",
                }}
              >
                {deleteProject.error?.message}
              </Content>
            </FlexItem>
          </Flex>
        )}
      </SplitItem>
    </Split>
  );
};
