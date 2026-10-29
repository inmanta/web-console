import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { hasAnySetValue, words } from "@inmanta/web-console-core";
import { DesiredStateVersionStatus } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import { Filter } from "@inmanta/web-console-feature-orchestration-engine/Slices/DesiredState/Core/Types";
import {
  ActiveFilterGroup,
  ActiveFilters,
  FilterDrawerPanelContent,
  getFilterActions,
} from "@inmanta/web-console-ui/Components/FilterDrawer";
import { IntRangeFilter, TimestampRangeFilter } from "@inmanta/web-console-ui/Components/Filters";
import { MultiTextSelect } from "@inmanta/web-console-ui/Components/MultiTextSelect";
import { CustomDatePresenter } from "@inmanta/web-console-ui/Utils";

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

  const { disregardDefault: _disregardDefault, ...filterValues } = filter;
  const hasActiveFilters = hasAnySetValue(filterValues);

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
