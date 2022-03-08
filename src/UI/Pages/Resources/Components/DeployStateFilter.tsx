import React from "react";
import { Resource } from "@/Core";
import { words } from "@/UI/words";
import { SelectIncludeExcludeFilter } from "./SelectIncludeExcludeFilter";

interface Props {
  filter: Resource.Filter;
  setFilter: (filter: Resource.FilterWithDefaultHandling) => void;
}

export const DeployStateFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const updateStatus = (statuses: string[]) =>
    setFilter({
      ...filter,
      status: statuses.length > 0 ? statuses : undefined,
      disregardDefault: true,
    });
  return (
    <SelectIncludeExcludeFilter
      isVisible={true}
      filterPropertyName={words("resources.column.deployState")}
      placeholder={words("resources.filters.status.placeholder")}
      possibleStates={Object.keys(Resource.Status).map(
        (k) => Resource.Status[k]
      )}
      selectedStates={filter.status ? filter.status : []}
      update={updateStatus}
    />
  );
};
