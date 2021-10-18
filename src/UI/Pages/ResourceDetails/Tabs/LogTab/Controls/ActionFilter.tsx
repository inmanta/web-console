import React from "react";
import { actionTypes, ResourceLogFilter } from "@/Core";
import { SelectOptionFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: ResourceLogFilter;
  setFilter: (filter: ResourceLogFilter) => void;
}

export const ActionFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (actions: string[]) =>
    setFilter({
      ...filter,
      action: actions.length > 0 ? actions : undefined,
    });

  return (
    <SelectOptionFilter
      isVisible={true}
      filterPropertyName="Action Type"
      placeholder={words("resources.logs.actionType.placeholder")}
      possibleStates={actionTypes}
      selectedStates={filter.action ? filter.action : []}
      update={update}
    />
  );
};
