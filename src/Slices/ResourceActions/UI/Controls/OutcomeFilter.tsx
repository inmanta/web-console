import React from "react";
import { SelectOptionFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { changeTypes, ResourceActionFilter } from "@S/ResourceActions/Core/Domain";

interface Props {
  filter: ResourceActionFilter;
  setFilter: (filter: ResourceActionFilter) => void;
}

/**
 * Filters resource actions by deploy outcome (the `change` value).
 *
 * The selected outcomes are the ones to include; they are translated into the
 * API's `exclude_changes` parameter when the request is built.
 *
 * @props {Props} props - The props of the component.
 * @returns {React.FC<Props>} The filter component.
 */
export const OutcomeFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (outcomes: string[]) =>
    setFilter({
      ...filter,
      outcome: outcomes.length > 0 ? outcomes : undefined,
    });

  return (
    <SelectOptionFilter
      isVisible
      filterPropertyName={words("resourceActions.filter.outcome")}
      placeholder={words("resourceActions.filter.outcome.placeholder")}
      possibleStates={[...changeTypes]}
      selectedStates={filter.outcome ?? []}
      update={update}
    />
  );
};
