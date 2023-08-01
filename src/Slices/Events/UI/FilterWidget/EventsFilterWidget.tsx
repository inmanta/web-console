import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { EventType, DateRange } from "@/Core";
import { FilterPicker } from "@/UI/Components";
import { SelectOptionFilter, TimestampFilter } from "@/UI/Components/Filters";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Filter, FilterKind, FilterList } from "@S/Events/Core/Query";
import { VersionFilter } from "./VersionFilter";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  states: string[];
}

export const EventsFilterWidget: React.FC<Props> = ({
  filter,
  setFilter,
  states,
}) => {
  const [filterKind, setFilterKind] = useState<FilterKind>(
    FilterKind.EventType,
  );

  const updateSource = (sources: string[]) =>
    setFilter({ ...filter, source: sources.length > 0 ? sources : undefined });

  const updateDestination = (destinations: string[]) =>
    setFilter({
      ...filter,
      destination: destinations.length > 0 ? destinations : undefined,
    });
  const eventTypes = Object.keys(EventType).map((k) => EventType[k]);

  const updateEventType = (eventTypes: string[]) =>
    setFilter({
      ...filter,
      event_type:
        eventTypes.length > 0
          ? eventTypes.map((eventType) => EventType[eventType])
          : undefined,
    });

  const updateVersion = (versions: string[]) =>
    setFilter({
      ...filter,
      version: versions.length > 0 ? versions : undefined,
    });

  const updateTimestamp = (timestampFilters: DateRange.Type[]) =>
    setFilter({
      ...filter,
      timestamp: timestampFilters.length > 0 ? timestampFilters : undefined,
    });
  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar">
      <FilterPicker
        setFilterKind={setFilterKind}
        filterKind={filterKind}
        items={FilterList}
      />
      <SelectOptionFilter
        filterPropertyName={FilterKind.EventType}
        placeholder={words("events.filters.eventType.placeholder")}
        isVisible={filterKind === FilterKind.EventType}
        possibleStates={eventTypes}
        selectedStates={filter.event_type ? filter.event_type : []}
        update={updateEventType}
      />
      <SelectOptionFilter
        filterPropertyName={FilterKind.Source}
        placeholder={words("events.filters.source.placeholder")}
        isVisible={filterKind === FilterKind.Source}
        possibleStates={states}
        selectedStates={filter.source ? filter.source : []}
        update={updateSource}
      />
      <SelectOptionFilter
        filterPropertyName={FilterKind.Destination}
        placeholder={words("events.filters.destination.placeholder")}
        isVisible={filterKind === FilterKind.Destination}
        possibleStates={states}
        selectedStates={filter.destination ? filter.destination : []}
        update={updateDestination}
      />
      <VersionFilter
        isVisible={filterKind === FilterKind.Version}
        versions={filter.version ? filter.version : []}
        update={updateVersion}
      />
      <TimestampFilter
        datePresenter={new MomentDatePresenter()}
        isVisible={filterKind === FilterKind.Date}
        timestampFilters={filter.timestamp ? filter.timestamp : []}
        update={updateTimestamp}
      />
    </ToolbarGroup>
  );
};
