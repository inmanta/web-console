import React from "react";
import { ResourceParams } from "@/Core";
import { ResourceStatus } from "@/Core";
import { SelectOptionFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: ResourceParams.Filter;
  setFilter: (filter: ResourceParams.Filter) => void;
}

export const DeployStateFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const updateStatus = (statuses: string[]) =>
    setFilter({
      ...filter,
      status:
        statuses.length > 0
          ? statuses.map((status) => ResourceStatus[status])
          : undefined,
    });

  return (
    <SelectOptionFilter
      isVisible={true}
      filterPropertyName={words("resources.column.deployState")}
      placeholder={words("resources.filters.status.placeholder")}
      possibleStates={Object.keys(ResourceStatus).map((k) => ResourceStatus[k])}
      selectedStates={filter.status ? filter.status : []}
      update={updateStatus}
    />
  );
};
