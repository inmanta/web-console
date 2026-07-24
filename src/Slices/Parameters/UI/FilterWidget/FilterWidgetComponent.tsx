import React from "react";
import { Divider, Form, Stack, StackItem } from "@patternfly/react-core";
import { Filter } from "@/Slices/Parameters/Core/Types";
import { CustomDatePresenter } from "@/UI";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
  getFilterActions,
} from "@/UI/Components";
import { TimestampRangeFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

const datePresenter = new CustomDatePresenter();

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  onClose: () => void;
}

/**
 * The FilterWidgetComponent for the Parameters page.
 *
 * Renders the side-panel drawer content with a free-text name filter, a free-text
 * source filter and an "updated" date range filter, followed by an active filters
 * chip section.
 *
 * @Props {Props} - Component props.
 *  @prop {Filter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: Filter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const {
    addString,
    removeStringChip,
    clearStringGroup,
    dateChips,
    removeDateChip,
    clearDateRange,
  } = getFilterActions(filter, setFilter);

  const hasActiveFilters =
    (filter.name?.length ?? 0) > 0 ||
    (filter.source?.length ?? 0) > 0 ||
    (filter.updated?.length ?? 0) > 0;

  return (
    <FilterDrawerPanelContent title={words("parameters.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <AddableTextInput
              label={words("parameters.columns.name")}
              placeholder={words("parameters.filters.name.placeholder")}
              onAdd={(value) => addString("name", value)}
            />
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("parameters.columns.source")}
              placeholder={words("parameters.filters.source.placeholder")}
              onAdd={(value) => addString("source", value)}
            />
          </StackItem>

          <StackItem>
            <TimestampRangeFilter
              label={words("parameters.columns.updated")}
              fromLabel={words("parameters.filters.from")}
              toLabel={words("parameters.filters.to")}
              value={filter.updated ?? []}
              onChange={(updated) => setFilter({ ...filter, updated })}
            />
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={() => setFilter({})}>
          {(filter.name?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("parameters.columns.name")}
                values={filter.name}
                onRemove={(value) => removeStringChip("name", value)}
                onRemoveGroup={() => clearStringGroup("name")}
              />
            </StackItem>
          )}
          {(filter.source?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("parameters.columns.source")}
                values={filter.source}
                onRemove={(value) => removeStringChip("source", value)}
                onRemoveGroup={() => clearStringGroup("source")}
              />
            </StackItem>
          )}
          {(filter.updated?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("parameters.columns.updated")}
                values={dateChips("updated", datePresenter)}
                onRemove={(label) => removeDateChip("updated", label)}
                onRemoveGroup={() => clearDateRange("updated")}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
