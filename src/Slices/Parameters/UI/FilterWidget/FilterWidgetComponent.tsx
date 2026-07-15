import React from "react";
import { Divider, Form, Stack, StackItem } from "@patternfly/react-core";
import { RangeOperator } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { Filter } from "@/Slices/Parameters/Core/Types";
import { CustomDatePresenter } from "@/UI";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
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
  // --- Name ---
  const addName = (value: string) =>
    setFilter({ ...filter, name: uniq([...(filter.name ?? []), value]) });

  const removeNameChip = (value: string) => {
    const updated = (filter.name ?? []).filter((n) => n !== value);

    setFilter({ ...filter, name: updated.length > 0 ? updated : undefined });
  };

  const clearNameFilters = () => setFilter({ ...filter, name: undefined });

  // --- Source ---
  const addSource = (value: string) =>
    setFilter({ ...filter, source: uniq([...(filter.source ?? []), value]) });

  const removeSourceChip = (value: string) => {
    const updated = (filter.source ?? []).filter((s) => s !== value);

    setFilter({ ...filter, source: updated.length > 0 ? updated : undefined });
  };

  const clearSourceFilters = () => setFilter({ ...filter, source: undefined });

  // --- Updated (date range) ---
  const removeUpdatedChip = (chip: string) => {
    const operator = chip.split("|")[0].trim() as RangeOperator.Operator;
    const updated = (filter.updated ?? []).filter((d) => d.operator !== operator);

    setFilter({ ...filter, updated: updated.length > 0 ? updated : undefined });
  };

  const clearUpdatedFilters = () => setFilter({ ...filter, updated: undefined });

  const clearAllFilters = () => setFilter({});

  // --- Chip display ---
  const updatedChips: string[] = (filter.updated ?? []).map(
    ({ date, operator }) => `${operator} | ${datePresenter.getFull(date.toISOString())}`
  );
  const hasActiveFilters =
    (filter.name?.length ?? 0) > 0 || (filter.source?.length ?? 0) > 0 || updatedChips.length > 0;

  return (
    <FilterDrawerPanelContent title={words("parameters.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <AddableTextInput
              label={words("parameters.columns.name")}
              placeholder={words("parameters.filters.name.placeholder")}
              onAdd={addName}
            />
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("parameters.columns.source")}
              placeholder={words("parameters.filters.source.placeholder")}
              onAdd={addSource}
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

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={clearAllFilters}>
          {(filter.name?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("parameters.columns.name")}
                values={filter.name}
                onRemove={removeNameChip}
                onRemoveGroup={clearNameFilters}
              />
            </StackItem>
          )}
          {(filter.source?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("parameters.columns.source")}
                values={filter.source}
                onRemove={removeSourceChip}
                onRemoveGroup={clearSourceFilters}
              />
            </StackItem>
          )}
          {updatedChips.length > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("parameters.columns.updated")}
                values={updatedChips}
                onRemove={removeUpdatedChip}
                onRemoveGroup={clearUpdatedFilters}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
