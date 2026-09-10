import React from "react";
import { SelectOptionFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { changeTypes, ResourceActionFilter } from "@S/ResourceActions/Core/Domain";

interface Props {
  filter: ResourceActionFilter;
  setFilter: (filter: ResourceActionFilter) => void;
}

/**
 * Filters resource actions by change (the deployment outcome).
 *
 * The selected changes are the ones to include; they are translated into the
 * API's `exclude_changes` parameter when the request is built.
 *
 * @props {Props} props - The props of the component.
 * @returns {React.FC<Props>} The filter component.
 */
export const ChangeFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (changes: string[]) =>
    setFilter({
      ...filter,
      outcome: changes.length > 0 ? changes : undefined,
    });

  return (
    <SelectOptionFilter
      isVisible
      filterPropertyName={words("resourceActions.filter.change")}
      placeholder={words("resourceActions.filter.change.placeholder")}
      possibleStates={[...changeTypes]}
      selectedStates={filter.outcome ?? []}
      update={update}
    />
  );
};
