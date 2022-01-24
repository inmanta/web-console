import React from "react";
import { Resource } from "@/Core";
import { SelectOptionFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: Resource.Filter;
  setFilter: (filter: Resource.Filter) => void;
}

export const DeployStateFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const updateStatus = (statuses: string[]) =>
    setFilter({
      ...filter,
      status:
        statuses.length > 0
          ? statuses.map((status) => Resource.Status[status])
          : undefined,
    });

  return (
    <SelectOptionFilter
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
