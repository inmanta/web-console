import React from "react";
import { FlatEnvironment, ProjectModel } from "@/Core";
import { useUrlStateWithFilter } from "@/Data";
import { CardView } from "./CardView";
import { FilterToolbar } from "./FilterToolbar";

interface Props {
  projects: ProjectModel[];
}

export interface Filters {
  projectFilter?: string[];
  environmentFilter?: string;
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
  const projectNames = projects.map((project) => project.name);
  const [filter, setFilter] = useUrlStateWithFilter<Filters>({ route: "Home" });
  const setProjectFilter = (projectFilter?: string[]) =>
    setFilter({ ...filter, projectFilter });
  const projectFilter = filter.projectFilter ? filter.projectFilter : [];
  const setEnvironmentFilter = (environmentFilter?: string) => {
    setFilter({
      ...filter,
      environmentFilter:
        environmentFilter === "" ? undefined : environmentFilter,
    });
  };
  const environmentFilter = filter.environmentFilter
    ? filter.environmentFilter
    : "";
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
        clearFilters={() =>
          setFilter({ projectFilter: undefined, environmentFilter: undefined })
        }
      />
      <CardView environments={filteredByEnvName} {...props} />
    </>
  );
};

function filterByName(
  filterableEnvironments: FlatEnvironment[],
  environmentFilter: string
): FlatEnvironment[] {
  return filterableEnvironments.filter((environment) => {
    if (environmentFilter && environmentFilter.length > 0) {
      return environment.name.includes(environmentFilter);
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
