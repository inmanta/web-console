import React from "react";
import {
  Button,
  Divider,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import {
  AddableTextInput,
  ActiveFilterGroup,
} from "@/Slices/Resource/UI/ResourcesPage/Components/FilterWidget";
import { words } from "@/UI/words";

export interface TypeAgentValueFilter {
  type?: string[];
  agent?: string[];
  value?: string[];
}

interface FilterWidgetComponentProps<T extends TypeAgentValueFilter> {
  onClose: () => void;
  filter: T;
  setFilter: (filter: T) => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Shared drawer panel content displaying type, agent and value filters,
 * used on pages that have no status filter (no tabs needed).
 *
 * @Props {FilterWidgetComponentProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *  @prop {T} filter - Current filter state.
 *  @prop {(filter: T) => void} setFilter - Setter to persist filter changes upstream.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent = <T extends TypeAgentValueFilter>({
  onClose,
  filter,
  setFilter,
}: FilterWidgetComponentProps<T>): React.ReactElement => {
  const handleAddType = (type: string) => {
    setFilter({
      ...filter,
      type: filter.type ? [...filter.type, type] : [type],
    } as T);
  };

  const handleAddAgent = (agent: string) => {
    setFilter({
      ...filter,
      agent: filter.agent ? [...filter.agent, agent] : [agent],
    } as T);
  };

  const handleAddValue = (value: string) => {
    setFilter({
      ...filter,
      value: filter.value ? [...filter.value, value] : [value],
    } as T);
  };

  const removeTypeChip = (id: string) => {
    setFilter({
      ...filter,
      type: filter.type?.filter((v) => v !== id),
    } as T);
  };

  const removeAgentChip = (id: string) => {
    setFilter({
      ...filter,
      agent: filter.agent?.filter((v) => v !== id),
    } as T);
  };

  const removeValueChip = (id: string) => {
    setFilter({
      ...filter,
      value: filter.value?.filter((v) => v !== id),
    } as T);
  };

  const clearTypeFilters = () => {
    setFilter({
      ...filter,
      type: undefined,
    } as T);
  };

  const clearAgentFilters = () => {
    setFilter({
      ...filter,
      agent: undefined,
    } as T);
  };

  const clearValueFilters = () => {
    setFilter({
      ...filter,
      value: undefined,
    } as T);
  };

  const clearAllFilters = () => {
    setFilter({ ...filter, type: undefined, agent: undefined, value: undefined } as T);
  };

  const hasActiveFilters =
    (filter.type && filter.type.length > 0) ||
    (filter.agent && filter.agent.length > 0) ||
    (filter.value && filter.value.length > 0);

  return (
    <DrawerPanelContent isResizable minSize="300px">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {words("resources.filters")}
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Stack hasGutter>
          <StackItem>
            <Stack hasGutter style={{ padding: "1rem 0" }}>
              <StackItem>
                <Title headingLevel="h3" size="md">
                  {words("resources.filters.resource.sectionTitle")}
                </Title>
              </StackItem>
              <StackItem>
                <AddableTextInput
                  label={words("resources.filters.resource.type.label")}
                  placeholder={words("resources.filters.resource.type.placeholder")}
                  onAdd={handleAddType}
                />
              </StackItem>
              <StackItem>
                <AddableTextInput
                  label={words("resources.filters.resource.agent.label")}
                  placeholder={words("resources.filters.resource.agent.placeholder")}
                  onAdd={handleAddAgent}
                />
              </StackItem>
              <StackItem>
                <AddableTextInput
                  label={words("resources.filters.resource.value.label")}
                  placeholder={words("resources.filters.resource.value.placeholder")}
                  onAdd={handleAddValue}
                />
              </StackItem>
            </Stack>
          </StackItem>
          <Divider />
          <StackItem>
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
                  <Button variant="link" isInline onClick={clearAllFilters}>
                    {words("resources.filters.active.clearAll")}
                  </Button>
                </FlexItem>
              )}
            </Flex>
            {hasActiveFilters ? (
              <Stack hasGutter style={{ padding: "1rem 0" }}>
                <StackItem>
                  <ActiveFilterGroup
                    title={words("resources.filters.resource.type.label")}
                    values={filter.type}
                    onRemove={removeTypeChip}
                    onRemoveGroup={clearTypeFilters}
                  />
                </StackItem>
                <StackItem>
                  <ActiveFilterGroup
                    title={words("resources.filters.resource.agent.label")}
                    values={filter.agent}
                    onRemove={removeAgentChip}
                    onRemoveGroup={clearAgentFilters}
                  />
                </StackItem>
                <StackItem>
                  <ActiveFilterGroup
                    title={words("resources.filters.resource.value.label")}
                    values={filter.value}
                    onRemove={removeValueChip}
                    onRemoveGroup={clearValueFilters}
                  />
                </StackItem>
              </Stack>
            ) : (
              <EmptyState variant="xs">
                <Title headingLevel="h4" size="md">
                  {words("resources.filters.active.empty.title")}
                </Title>
                <EmptyStateBody>
                  {words("resources.filters.active.empty.body.noTabs")}
                </EmptyStateBody>
              </EmptyState>
            )}
          </StackItem>
        </Stack>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};
