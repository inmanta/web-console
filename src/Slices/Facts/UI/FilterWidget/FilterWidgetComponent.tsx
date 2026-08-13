import React from "react";
import { Divider, Form, Stack, StackItem } from "@patternfly/react-core";
import { Filter } from "@/Slices/Facts/Core/Types";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
  getFilterActions,
} from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  onClose: () => void;
}

/**
 * The FilterWidgetComponent for the Facts page.
 *
 * Renders the side-panel drawer content with a free-text name filter and a free-text
 * resource id filter, followed by an active filters chip section.
 *
 * @Props {Props} - Component props.
 *  @prop {Filter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: Filter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const { addString, removeStringChip, clearStringGroup } = getFilterActions(filter, setFilter);

  const hasActiveFilters = (filter.name?.length ?? 0) > 0 || (filter.resource_id?.length ?? 0) > 0;

  return (
    <FilterDrawerPanelContent title={words("facts.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <AddableTextInput
              label={words("facts.column.name")}
              placeholder={words("facts.filters.name.placeholder")}
              onAdd={(value) => addString("name", value)}
              type="search"
            />
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("facts.column.resourceId")}
              placeholder={words("facts.filters.resourceId.placeholder")}
              onAdd={(value) => addString("resource_id", value)}
              type="search"
            />
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={() => setFilter({})}>
          {(filter.name?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("facts.column.name")}
                values={filter.name}
                onRemove={(value) => removeStringChip("name", value)}
                onRemoveGroup={() => clearStringGroup("name")}
              />
            </StackItem>
          )}
          {(filter.resource_id?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("facts.column.resourceId")}
                values={filter.resource_id}
                onRemove={(value) => removeStringChip("resource_id", value)}
                onRemoveGroup={() => clearStringGroup("resource_id")}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
