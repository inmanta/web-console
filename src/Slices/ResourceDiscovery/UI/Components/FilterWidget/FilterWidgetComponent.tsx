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
import { Filter } from "@/Data/Queries";
import {
  AddableTextInput,
  ActiveFilterGroup,
} from "@/Slices/Resource/UI/ResourcesPage/Components/FilterWidget";
import { words } from "@/UI/words";

interface FilterWidgetComponentProps {
  onClose: () => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Drawer panel content displaying the discovered resources filter form
 * using the same layout pattern as the Resources page filter widget.
 *
 * @Props {FilterWidgetComponentProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *  @prop {Filter} filter - Current filter state.
 *  @prop {(filter: Filter) => void} setFilter - Setter to persist filter changes upstream.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<FilterWidgetComponentProps> = ({
  onClose,
  filter,
  setFilter,
}) => {
  const handleAddType = (type: string) =>
    setFilter({ ...filter, type: filter.type ? [...filter.type, type] : [type] });

  const handleAddAgent = (agent: string) =>
    setFilter({ ...filter, agent: filter.agent ? [...filter.agent, agent] : [agent] });

  const handleAddValue = (value: string) =>
    setFilter({ ...filter, value: filter.value ? [...filter.value, value] : [value] });

  const removeTypeChip = (id: string) =>
    setFilter({ ...filter, type: filter.type?.filter((v) => v !== id) });

  const removeAgentChip = (id: string) =>
    setFilter({ ...filter, agent: filter.agent?.filter((v) => v !== id) });

  const removeValueChip = (id: string) =>
    setFilter({ ...filter, value: filter.value?.filter((v) => v !== id) });

  const clearAllFilters = () => setFilter({});

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
                    onRemoveGroup={() => setFilter({ ...filter, type: undefined })}
                  />
                </StackItem>
                <StackItem>
                  <ActiveFilterGroup
                    title={words("resources.filters.resource.agent.label")}
                    values={filter.agent}
                    onRemove={removeAgentChip}
                    onRemoveGroup={() => setFilter({ ...filter, agent: undefined })}
                  />
                </StackItem>
                <StackItem>
                  <ActiveFilterGroup
                    title={words("resources.filters.resource.value.label")}
                    values={filter.value}
                    onRemove={removeValueChip}
                    onRemoveGroup={() => setFilter({ ...filter, value: undefined })}
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
