import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { EventType } from "@/Core";
import { Filter } from "@/Slices/Events/Core/Types";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
  MultiTextSelect,
  getFilterActions,
} from "@/UI/Components";
import { TimestampRangeFilter } from "@/UI/Components/Filters";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";

const datePresenter = new CustomDatePresenter();

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  states: string[];
  onClose: () => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Renders the contents of the Events filter side panel. The event type, source,
 * destination, version and date filters are all shown at once inside a
 * DrawerPanelContent, together with a section that lists the currently active
 * filters as removable chips.
 *
 * @Props {Props} - Component props.
 *  @prop {Filter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: Filter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {string[]} states - The service lifecycle states used to populate the source and destination filters.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, states, onClose }) => {
  const {
    addString,
    toggleString,
    removeStringChip,
    clearStringGroup,
    dateChips,
    removeDateChip,
    clearDateRange,
  } = getFilterActions(filter, setFilter);

  const eventTypes = Object.values(EventType);

  const onSelect =
    (key: "event_type" | "source" | "destination") =>
    (selection: string | ((prev: string[]) => string[])) => {
      if (typeof selection === "string") {
        toggleString(key, selection);
      }
    };

  const hasActiveFilters =
    (filter.event_type?.length ?? 0) > 0 ||
    (filter.source?.length ?? 0) > 0 ||
    (filter.destination?.length ?? 0) > 0 ||
    (filter.version?.length ?? 0) > 0 ||
    (filter.timestamp?.length ?? 0) > 0;

  return (
    <FilterDrawerPanelContent title={words("events.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("events.column.eventType")}>
              <MultiTextSelect
                toggleAriaLabel="EventType"
                options={eventTypes.map((eventType) => ({
                  value: eventType,
                  children: eventType,
                  isSelected: (filter.event_type ?? []).includes(eventType),
                }))}
                setSelected={onSelect("event_type")}
                placeholderText={words("events.filters.eventType.placeholder")}
                selected={filter.event_type ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("events.column.sourceState")}>
              <MultiTextSelect
                toggleAriaLabel="Source"
                options={states.map((state) => ({
                  value: state,
                  children: state,
                  isSelected: (filter.source ?? []).includes(state),
                }))}
                setSelected={onSelect("source")}
                placeholderText={words("events.filters.source.placeholder")}
                selected={filter.source ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("events.column.destinationState")}>
              <MultiTextSelect
                toggleAriaLabel="Destination"
                options={states.map((state) => ({
                  value: state,
                  children: state,
                  isSelected: (filter.destination ?? []).includes(state),
                }))}
                setSelected={onSelect("destination")}
                placeholderText={words("events.filters.destination.placeholder")}
                selected={filter.destination ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("events.filters.version.label")}
              placeholder={words("events.filters.version.placeholder")}
              onAdd={(value) => addString("version", value)}
              type="number"
            />
          </StackItem>

          <StackItem>
            <TimestampRangeFilter
              label={words("events.column.date")}
              fromLabel={words("events.filters.from")}
              toLabel={words("events.filters.to")}
              value={filter.timestamp ?? []}
              onChange={(timestamp) => setFilter({ ...filter, timestamp })}
            />
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={() => setFilter({})}>
          {(filter.event_type?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.column.eventType")}
                values={filter.event_type}
                onRemove={(value) => removeStringChip("event_type", value)}
                onRemoveGroup={() => clearStringGroup("event_type")}
              />
            </StackItem>
          )}
          {(filter.source?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.column.sourceState")}
                values={filter.source}
                onRemove={(value) => removeStringChip("source", value)}
                onRemoveGroup={() => clearStringGroup("source")}
              />
            </StackItem>
          )}
          {(filter.destination?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.column.destinationState")}
                values={filter.destination}
                onRemove={(value) => removeStringChip("destination", value)}
                onRemoveGroup={() => clearStringGroup("destination")}
              />
            </StackItem>
          )}
          {(filter.version?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.filters.version.label")}
                values={filter.version}
                onRemove={(value) => removeStringChip("version", value)}
                onRemoveGroup={() => clearStringGroup("version")}
              />
            </StackItem>
          )}
          {(filter.timestamp?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.column.date")}
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
