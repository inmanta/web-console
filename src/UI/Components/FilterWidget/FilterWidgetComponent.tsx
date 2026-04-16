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

export interface FilterField {
  label: string;
  placeholder: string;
  filterKey: string;
}

export type GenericFilter = Record<string, string[] | undefined>;

interface FilterWidgetComponentProps<GenericFilter> {
  onClose: () => void;
  fields: FilterField[];
  filter: GenericFilter;
  setFilter: (filter: GenericFilter) => void;
  sectionTitle: string;
}

/**
 * The FilterWidgetComponent component.
 *
 * Shared drawer panel content displaying configurable string-array filters,
 * used on pages that have no status filter (no tabs needed).
 *
 * @Props {FilterWidgetComponentProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *  @prop {FilterField[]} fields - Configuration for each filter field (label, placeholder, filterKey).
 *  @prop {GenericFilter} filter - Current filter state keyed by filterKey.
 *  @prop {(filter: GenericFilter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {string} sectionTitle - Title displayed above the input fields section.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent = ({
  onClose,
  fields,
  filter,
  setFilter,
  sectionTitle,
}: FilterWidgetComponentProps<GenericFilter>): React.ReactElement => {
  const handleAdd = (key: string, value: string) => {
    const current = filter[key];
    setFilter({ ...filter, [key]: current ? [...current, value] : [value] });
  };

  const handleRemoveChip = (key: string, id: string) => {
    setFilter({ ...filter, [key]: filter[key]?.filter((v) => v !== id) });
  };

  const handleClearGroup = (key: string) => {
    setFilter({ ...filter, [key]: undefined });
  };

  const clearAllFilters = () => {
    const cleared: GenericFilter = { ...filter };
    fields.forEach(({ filterKey }) => {
      cleared[filterKey] = undefined;
    });
    setFilter(cleared);
  };

  const hasActiveFilters = fields.some(({ filterKey }) => {
    const values = filter[filterKey];
    return values && values.length > 0;
  });

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
                  {sectionTitle}
                </Title>
              </StackItem>
              {fields.map(({ label, placeholder, filterKey }) => (
                <StackItem key={filterKey}>
                  <AddableTextInput
                    label={label}
                    placeholder={placeholder}
                    onAdd={(value) => handleAdd(filterKey, value)}
                  />
                </StackItem>
              ))}
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
                {fields.map(({ label, filterKey }) => (
                  <StackItem key={filterKey}>
                    <ActiveFilterGroup
                      title={label}
                      values={filter[filterKey]}
                      onRemove={(id) => handleRemoveChip(filterKey, id)}
                      onRemoveGroup={() => handleClearGroup(filterKey)}
                    />
                  </StackItem>
                ))}
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
