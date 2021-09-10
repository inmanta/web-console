import React from "react";
import { SelectOptionFilter } from "@/UI/Components/Filters";
import { ResourceLogFilter } from "@/Core/Domain/Query";

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
      placeholder="Action Type..."
      possibleStates={values}
      selectedStates={filter.action ? filter.action : []}
      update={update}
    />
  );
};

const values = [
  "store",
  "push",
  "pull",
  "deploy",
  "dryrun",
  "getfact",
  "other",
];
