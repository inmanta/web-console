import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { EventType, RangeOperator, toggleValueInList } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { Filter } from "@/Slices/Events/Core/Types";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
  MultiTextSelect,
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
  const eventTypes = Object.values(EventType);

  // --- Event type ---
  const handleEventTypeSelect = (selection: string | ((prev: string[]) => string[])) => {
    if (typeof selection !== "string") {
      return;
    }

    const updated = uniq(toggleValueInList(selection, filter.event_type ?? [])) as EventType[];

    setFilter({ ...filter, event_type: updated.length > 0 ? updated : undefined });
  };

  const removeEventTypeChip = (value: string) => {
    const updated = (filter.event_type ?? []).filter((eventType) => eventType !== value);

    setFilter({ ...filter, event_type: updated.length > 0 ? updated : undefined });
  };

  const clearEventTypeFilters = () => setFilter({ ...filter, event_type: undefined });

  // --- Source ---
  const handleSourceSelect = (selection: string | ((prev: string[]) => string[])) => {
    if (typeof selection !== "string") {
      return;
    }

    const updated = uniq(toggleValueInList(selection, filter.source ?? []));

    setFilter({ ...filter, source: updated.length > 0 ? updated : undefined });
  };

  const removeSourceChip = (value: string) => {
    const updated = (filter.source ?? []).filter((source) => source !== value);

    setFilter({ ...filter, source: updated.length > 0 ? updated : undefined });
  };

  const clearSourceFilters = () => setFilter({ ...filter, source: undefined });

  // --- Destination ---
  const handleDestinationSelect = (selection: string | ((prev: string[]) => string[])) => {
    if (typeof selection !== "string") {
      return;
    }

    const updated = uniq(toggleValueInList(selection, filter.destination ?? []));

    setFilter({ ...filter, destination: updated.length > 0 ? updated : undefined });
  };

  const removeDestinationChip = (value: string) => {
    const updated = (filter.destination ?? []).filter((destination) => destination !== value);

    setFilter({ ...filter, destination: updated.length > 0 ? updated : undefined });
  };

  const clearDestinationFilters = () => setFilter({ ...filter, destination: undefined });

  // --- Version ---
  const addVersion = (value: string) =>
    setFilter({ ...filter, version: uniq([...(filter.version ?? []), value]) });

  const removeVersionChip = (value: string) => {
    const updated = (filter.version ?? []).filter((version) => version !== value);

    setFilter({ ...filter, version: updated.length > 0 ? updated : undefined });
  };

  const clearVersionFilters = () => setFilter({ ...filter, version: undefined });

  // --- Date ---
  const removeTimestampChip = (operator: RangeOperator.Operator) => {
    const updated = (filter.timestamp ?? []).filter((entry) => entry.operator !== operator);

    setFilter({ ...filter, timestamp: updated.length > 0 ? updated : undefined });
  };

  const clearTimestampFilters = () => setFilter({ ...filter, timestamp: undefined });

  const clearAllFilters = () => setFilter({});

  const timestampChips = (filter.timestamp ?? []).map((entry) => ({
    operator: entry.operator,
    label: `${entry.operator} | ${datePresenter.getFull(entry.date.toISOString())}`,
  }));

  const removeTimestampChipByLabel = (label: string) => {
    const chip = timestampChips.find((entry) => entry.label === label);

    if (chip) {
      removeTimestampChip(chip.operator);
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
                setSelected={handleEventTypeSelect}
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
                setSelected={handleSourceSelect}
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
                setSelected={handleDestinationSelect}
                placeholderText={words("events.filters.destination.placeholder")}
                selected={filter.destination ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("events.filters.version.label")}
              placeholder={words("events.filters.version.placeholder")}
              onAdd={addVersion}
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

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={clearAllFilters}>
          {(filter.event_type?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.column.eventType")}
                values={filter.event_type}
                onRemove={removeEventTypeChip}
                onRemoveGroup={clearEventTypeFilters}
              />
            </StackItem>
          )}
          {(filter.source?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.column.sourceState")}
                values={filter.source}
                onRemove={removeSourceChip}
                onRemoveGroup={clearSourceFilters}
              />
            </StackItem>
          )}
          {(filter.destination?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.column.destinationState")}
                values={filter.destination}
                onRemove={removeDestinationChip}
                onRemoveGroup={clearDestinationFilters}
              />
            </StackItem>
          )}
          {(filter.version?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.filters.version.label")}
                values={filter.version}
                onRemove={removeVersionChip}
                onRemoveGroup={clearVersionFilters}
              />
            </StackItem>
          )}
          {timestampChips.length > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("events.column.date")}
                values={timestampChips.map((chip) => chip.label)}
                onRemove={removeTimestampChipByLabel}
                onRemoveGroup={clearTimestampFilters}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
