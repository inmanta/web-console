import React from "react";
import { StackItem } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { ActiveFilterGroup, ActiveFilters } from "@/UI/Components";
import { words } from "@/UI/words";

export interface ActiveFiltersSectionProps {
  filter: Resource.FilterWithDefaultHandling;
  onResetFilters: () => void;
  removeTypeChip: (id: string) => void;
  removeAgentChip: (id: string) => void;
  removeValueChip: (id: string) => void;
  removeStatusChip: (id: string) => void;
  clearTypeFilters: () => void;
  clearAgentFilters: () => void;
  clearValueFilters: () => void;
  clearStatusFilters: () => void;
}

/**
 * The ActiveFiltersSection component.
 *
 * This component is responsible of displaying the currently applied filters
 * and allows removal of individual chips or whole categories.
 *
 * @Props {ActiveFiltersSectionProps} - Component props.
 *  @prop {Resource.Filter} filter - Current filter state used to determine the active chips.
 *  @prop {() => void} onResetFilters - Resets all filters back to the default !orphaned state.
 *  @prop {(id: string) => void} removeTypeChip - Removes a single type chip.
 *  @prop {(id: string) => void} removeAgentChip - Removes a single agent chip.
 *  @prop {(id: string) => void} removeValueChip - Removes a single value chip.
 *  @prop {(id: string) => void} removeStatusChip - Removes a single status chip.
 *  @prop {() => void} clearTypeFilters - Clears the entire set of type filters.
 *  @prop {() => void} clearAgentFilters - Clears the entire set of agent filters.
 *  @prop {() => void} clearValueFilters - Clears the entire set of value filters.
 *  @prop {() => void} clearStatusFilters - Clears the entire set of status filters.
 *
 * @returns {React.ReactElement} The rendered active filters panel.
 */
export const ActiveFiltersSection: React.FC<ActiveFiltersSectionProps> = ({
  filter,
  onResetFilters,
  removeTypeChip,
  removeAgentChip,
  removeValueChip,
  removeStatusChip,
  clearTypeFilters,
  clearAgentFilters,
  clearValueFilters,
  clearStatusFilters,
}) => {
  const hasActiveFilters =
    (filter.type && filter.type.length > 0) ||
    (filter.agent && filter.agent.length > 0) ||
    (filter.value && filter.value.length > 0) ||
    (filter.status && filter.status.length > 0);

  return (
    <ActiveFilters
      hasActiveFilters={Boolean(hasActiveFilters)}
      onClear={onResetFilters}
      emptyStateBody={words("resources.filters.active.empty.body")}
    >
      {filter.type && filter.type.length > 0 && (
        <StackItem>
          <ActiveFilterGroup
            title={words("resources.filters.resource.type.label")}
            values={filter.type}
            onRemove={removeTypeChip}
            onRemoveGroup={clearTypeFilters}
          />
        </StackItem>
      )}
      {filter.agent && filter.agent.length > 0 && (
        <StackItem>
          <ActiveFilterGroup
            title={words("resources.filters.resource.agent.label")}
            values={filter.agent}
            onRemove={removeAgentChip}
            onRemoveGroup={clearAgentFilters}
          />
        </StackItem>
      )}
      {filter.value && filter.value.length > 0 && (
        <StackItem>
          <ActiveFilterGroup
            title={words("resources.filters.resource.value.label")}
            values={filter.value}
            onRemove={removeValueChip}
            onRemoveGroup={clearValueFilters}
          />
        </StackItem>
      )}
      {filter.status && filter.status.length > 0 && (
        <StackItem>
          <ActiveFilterGroup
            title={words("resources.column.status")}
            values={filter.status}
            onRemove={removeStatusChip}
            onRemoveGroup={clearStatusFilters}
          />
        </StackItem>
      )}
    </ActiveFilters>
  );
};
