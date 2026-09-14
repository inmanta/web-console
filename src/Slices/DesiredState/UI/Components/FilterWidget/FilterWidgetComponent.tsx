import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import { CustomDatePresenter } from "@/UI";
import {
  ActiveFilterGroup,
  ActiveFilters,
  FilterDrawerPanelContent,
  MultiTextSelect,
  getFilterActions,
} from "@/UI/Components";
import { IntRangeFilter, TimestampRangeFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";

const datePresenter = new CustomDatePresenter();

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  onClose: () => void;
}

export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const {
    toggleString,
    removeStringChip,
    clearStringGroup,
    dateChips,
    removeDateChip,
    clearDateRange,
    intChips,
    removeIntChip,
    clearIntRange,
  } = getFilterActions(filter, setFilter);

  const desiredStateStatuses = Object.values(DesiredStateVersionStatus);

  const clearAllFilters = () => setFilter({});

  const hasActiveFilters =
    (filter.status?.length ?? 0) > 0 ||
    (filter.date?.length ?? 0) > 0 ||
    (filter.version?.length ?? 0) > 0;

  return (
    <FilterDrawerPanelContent title={words("filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("status")}>
              <MultiTextSelect
                toggleAriaLabel="Status"
                options={desiredStateStatuses.map((status) => ({
                  value: status,
                  children: status,
                  isSelected: (filter.status ?? []).includes(status),
                }))}
                setSelected={(selection) => {
                  if (typeof selection === "string") {
                    toggleString("status", selection);
                  }
                }}
                placeholderText={words("desiredState.filters.status.placeholder")}
                selected={filter.status ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <TimestampRangeFilter
              label={words("date")}
              fromLabel={words("filters.from")}
              toLabel={words("filters.to")}
              value={filter.date ?? []}
              onChange={(date) => setFilter({ ...filter, date })}
            />
          </StackItem>

          <StackItem>
            <IntRangeFilter
              label={words("version")}
              fromLabel={words("filters.from")}
              toLabel={words("filters.to")}
              value={filter.version ?? []}
              onChange={(version) => setFilter({ ...filter, version })}
            />
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={clearAllFilters}>
          {(filter.status ?? []).length > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("status")}
                values={filter.status}
                onRemove={(value) => removeStringChip("status", value, { disregardDefault: true })}
                onRemoveGroup={() => clearStringGroup("status", { disregardDefault: true })}
              />
            </StackItem>
          )}
          {(filter.date?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("date")}
                values={dateChips("date", datePresenter)}
                onRemove={(label) => removeDateChip("date", label)}
                onRemoveGroup={() => clearDateRange("date")}
              />
            </StackItem>
          )}
          {(filter.version?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("version")}
                values={intChips("version")}
                onRemove={(label) => removeIntChip("version", label)}
                onRemoveGroup={() => clearIntRange("version")}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
