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

/**
 * @interface ActiveFiltersSectionProps
 * @desc Props for ActiveFiltersSection.
 * @property {Resource.Filter} filter - Current filter state used to determine the active chips.
 * @property {() => void} onClearAll - Clears all filters in one action.
 * @property {(id: string) => void} removeTypeChip - Removes a single type chip.
 * @property {(id: string) => void} removeAgentChip - Removes a single agent chip.
 * @property {(id: string) => void} removeValueChip - Removes a single value chip.
 * @property {(id: string) => void} removeStatusChip - Removes a single status chip.
 * @property {() => void} clearTypeFilters - Clears the entire set of type filters.
 * @property {() => void} clearAgentFilters - Clears the entire set of agent filters.
 * @property {() => void} clearValueFilters - Clears the entire set of value filters.
 * @property {() => void} clearStatusFilters - Clears the entire set of status filters.
 */
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
 * @component ActiveFiltersSection
 * @desc Displays the currently applied filters and allows removal of individual chips or whole categories.
 * @param {ActiveFiltersSectionProps} props - Component props.
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
