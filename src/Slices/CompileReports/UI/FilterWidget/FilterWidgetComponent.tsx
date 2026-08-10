import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { CompileStatus } from "@/Core";
import { Filter } from "@/Slices/CompileReports/Core/Types";
import {
  ActiveFilterGroup,
  ActiveFilters,
  FilterDrawerPanelContent,
  SingleTextSelect,
  getFilterActions,
} from "@/UI/Components";
import { TimestampRangeFilter } from "@/UI/Components/Filters";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";

const datePresenter = new CustomDatePresenter();

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  onClose: () => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Renders the contents of the Compile Reports filter side panel. The status and
 * requested-date filters are shown at once inside a DrawerPanelContent, together
 * with a section that lists the currently active filters as removable chips.
 *
 * @Props {Props} - Component props.
 *  @prop {Filter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: Filter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const { dateChips, removeDateChip, clearDateRange } = getFilterActions(filter, setFilter);

  const statusOptions = Object.values(CompileStatus).map((value) => ({
    value,
    children: value,
  }));

  const updateStatus = (value: string | null) =>
    setFilter({
      ...filter,
      status: value ? CompileStatus[value.replace(/\s+/g, "")] : undefined,
    });

  const hasActiveFilters = Boolean(filter.status) || (filter.requested?.length ?? 0) > 0;

  return (
    <FilterDrawerPanelContent title={words("compileReports.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("compileReports.columns.status")}>
              <SingleTextSelect
                toggleAriaLabel={words("compileReports.columns.status")}
                placeholderText={words("compileReports.filters.status.placeholder")}
                options={statusOptions}
                selected={filter.status ?? null}
                setSelected={updateStatus}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <TimestampRangeFilter
              label={words("compileReports.columns.requested")}
              fromLabel={words("filters.from")}
              toLabel={words("filters.to")}
              value={filter.requested ?? []}
              onChange={(requested) =>
                setFilter({ ...filter, requested: requested.length > 0 ? requested : undefined })
              }
            />
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={() => setFilter({})}>
          {filter.status && (
            <StackItem>
              <ActiveFilterGroup
                title={words("compileReports.columns.status")}
                values={[filter.status]}
                onRemove={() => setFilter({ ...filter, status: undefined })}
                onRemoveGroup={() => setFilter({ ...filter, status: undefined })}
              />
            </StackItem>
          )}
          {(filter.requested?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("compileReports.columns.requested")}
                values={dateChips("requested", datePresenter)}
                onRemove={(label) => removeDateChip("requested", label)}
                onRemoveGroup={() => clearDateRange("requested")}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
