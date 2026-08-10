import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { LogLevelsList } from "@/Core";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
  MultiTextSelect,
  SingleTextSelect,
  getFilterActions,
} from "@/UI/Components";
import { TimestampRangeFilter } from "@/UI/Components/Filters";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { ResourceLogFilter, actionTypes } from "@S/ResourceDetails/Core/ResourceLog";

const datePresenter = new CustomDatePresenter();

interface Props {
  filter: ResourceLogFilter;
  setFilter: (filter: ResourceLogFilter) => void;
  onClose: () => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Renders the contents of the resource logs filter side panel. The action type,
 * log level, message and timestamp filters are all shown at once inside a
 * DrawerPanelContent, together with a section that lists the currently active
 * filters as removable chips.
 *
 * @Props {Props} - Component props.
 *  @prop {ResourceLogFilter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: ResourceLogFilter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const {
    addString,
    toggleString,
    removeStringChip,
    clearStringGroup,
    dateChips,
    removeDateChip,
    clearDateRange,
  } = getFilterActions(filter, setFilter);

  const logLevelOptions = LogLevelsList.map((level) => ({ value: level, children: level }));

  const onSelectAction = (selection: string | ((prev: string[]) => string[])) => {
    if (typeof selection === "string") {
      toggleString("action", selection);
    }
  };

  const updateLogLevel = (value: string | null) =>
    setFilter({ ...filter, minimal_log_level: value || undefined });

  const hasActiveFilters =
    (filter.action?.length ?? 0) > 0 ||
    Boolean(filter.minimal_log_level) ||
    (filter.message?.length ?? 0) > 0 ||
    (filter.timestamp?.length ?? 0) > 0;

  return (
    <FilterDrawerPanelContent title={words("resources.logs.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("resources.logs.actionType")}>
              <MultiTextSelect
                toggleAriaLabel="ActionType"
                options={actionTypes.map((action) => ({
                  value: action,
                  children: action,
                  isSelected: (filter.action ?? []).includes(action),
                }))}
                setSelected={onSelectAction}
                placeholderText={words("resources.logs.actionType.placeholder")}
                selected={filter.action ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("resources.logs.logLevel")}>
              <SingleTextSelect
                toggleAriaLabel="MinimalLogLevel"
                placeholderText={words("resources.logs.logLevel.placeholder")}
                options={logLevelOptions}
                selected={filter.minimal_log_level ?? null}
                setSelected={updateLogLevel}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("resources.logs.message")}
              placeholder={words("resources.logs.message.placeholder")}
              onAdd={(value) => addString("message", value)}
              type="search"
            />
          </StackItem>

          <StackItem>
            <TimestampRangeFilter
              label={words("resources.logs.timestamp")}
              fromLabel={words("filters.from")}
              toLabel={words("filters.to")}
              value={filter.timestamp ?? []}
              onChange={(timestamp) =>
                setFilter({ ...filter, timestamp: timestamp.length > 0 ? timestamp : undefined })
              }
            />
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={() => setFilter({})}>
          {(filter.action?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("resources.logs.actionType")}
                values={filter.action}
                onRemove={(value) => removeStringChip("action", value)}
                onRemoveGroup={() => clearStringGroup("action")}
              />
            </StackItem>
          )}
          {filter.minimal_log_level && (
            <StackItem>
              <ActiveFilterGroup
                title={words("resources.logs.logLevel")}
                values={[filter.minimal_log_level]}
                onRemove={() => setFilter({ ...filter, minimal_log_level: undefined })}
                onRemoveGroup={() => setFilter({ ...filter, minimal_log_level: undefined })}
              />
            </StackItem>
          )}
          {(filter.message?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("resources.logs.message")}
                values={filter.message}
                onRemove={(value) => removeStringChip("message", value)}
                onRemoveGroup={() => clearStringGroup("message")}
              />
            </StackItem>
          )}
          {(filter.timestamp?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("resources.logs.timestamp")}
                values={dateChips("timestamp", datePresenter)}
                onRemove={(label) => removeDateChip("timestamp", label)}
                onRemoveGroup={() => clearDateRange("timestamp")}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
