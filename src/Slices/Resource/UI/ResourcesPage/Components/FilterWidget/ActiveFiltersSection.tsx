import React from "react";
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { Resource } from "@/Core";
import { words } from "@/UI/words";
import { ActiveFilterGroup } from "./ActiveFilterGroup";

export interface ActiveFiltersSectionProps {
  filter: Resource.Filter;
  onClearAll: () => void;
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
 *  @prop {() => void} onClearAll - Clears all filters in one action.
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
  onClearAll,
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
    <StackItem style={{ minHeight: "300px" }}>
      <Flex
        justifyContent={{ default: "justifyContentSpaceBetween" }}
        alignItems={{ default: "alignItemsCenter" }}
      >
        <FlexItem>
          <Title headingLevel="h3" size="md">
            {words("resources.filters.active.title")}
          </Title>
        </FlexItem>
        {hasActiveFilters && (
          <FlexItem>
            <Button variant="link" isInline onClick={onClearAll}>
              {words("resources.filters.active.clearAll")}
            </Button>
          </FlexItem>
        )}
      </Flex>
      {hasActiveFilters ? (
        <Stack hasGutter style={{ padding: "1rem 0" }}>
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
                title={words("resources.column.deployState")}
                values={filter.status}
                onRemove={removeStatusChip}
                onRemoveGroup={clearStatusFilters}
              />
            </StackItem>
          )}
        </Stack>
      ) : (
        <EmptyState variant="xs">
          <Title headingLevel="h4" size="md">
            {words("resources.filters.active.empty.title")}
          </Title>
          <EmptyStateBody>{words("resources.filters.active.empty.body")}</EmptyStateBody>
        </EmptyState>
      )}
    </StackItem>
  );
};
