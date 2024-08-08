import React from "react";
import { FlatEnvironment } from "@/Core";
import { useUrlStateWithFilter } from "@/Data";
import { CardView } from "./CardView";
import { FilterToolbar } from "./FilterToolbar";

interface Props {
  environments: FlatEnvironment[];
}

export interface Filters {
  projectFilter?: string[];
  environmentFilter?: string;
}

export const EnvironmentsOverview: React.FC<Props> = ({
  environments,
  ...props
}) => {
  const projectNames = Array.from(
    new Set(environments.map((environment) => environment.projectName)),
  );
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
  const filteredByProjectName = filterByProject(environments, projectFilter);
  const filteredByEnvName = filterByName(
    filteredByProjectName,
    environmentFilter,
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
  environmentFilter: string,
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
  projectFilter: string[],
): FlatEnvironment[] {
  return filterableEnvironments.filter((environment) => {
    if (projectFilter && projectFilter.length > 0) {
      return projectFilter.includes(environment.projectName);
    }
    return true;
  });
}
