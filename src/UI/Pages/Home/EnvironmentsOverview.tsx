import { FlatEnvironment, ProjectModel } from "@/Core";
import React, { useState } from "react";
import { CardView } from "./CardView";
import { FilterToolbar } from "./FilterToolbar";

interface Props {
  projects: ProjectModel[];
}

export const EnvironmentsOverview: React.FC<Props> = ({
  projects,
  ...props
}) => {
  const filterableEnvironments = projects.flatMap((project) => [
    ...project.environments.map((environment) => ({
      ...environment,
      projectName: project.name,
    })),
  ]);
  const [projectFilter, setProjectFilter] = useState<string[]>([]);
  const projectNames = projects.map((project) => project.name);
  const [environmentFilter, setEnvironmentFilter] = useState<string[]>([]);
  const filteredByProjectName = filterByProject(
    filterableEnvironments,
    projectFilter
  );
  const filteredByEnvName = filterByName(
    filteredByProjectName,
    environmentFilter
  );
  return (
    <>
      <FilterToolbar
        projectNames={projectNames}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        environmentFilter={environmentFilter}
        setEnvironmentFilter={setEnvironmentFilter}
      />
      <CardView environments={filteredByEnvName} {...props} />
    </>
  );
};

function filterByName(
  filterableEnvironments: FlatEnvironment[],
  environmentFilter: string[]
): FlatEnvironment[] {
  return filterableEnvironments.filter((environment) => {
    if (environmentFilter && environmentFilter.length > 0) {
      const filterMatches = environmentFilter.filter((envFilter) =>
        environment.name.includes(envFilter)
      );
      return filterMatches.length > 0;
    }
    return true;
  });
}

function filterByProject(
  filterableEnvironments: FlatEnvironment[],
  projectFilter: string[]
): FlatEnvironment[] {
  return filterableEnvironments.filter((environment) => {
    if (projectFilter && projectFilter.length > 0) {
      return projectFilter.includes(environment.projectName);
    }
    return true;
  });
}
