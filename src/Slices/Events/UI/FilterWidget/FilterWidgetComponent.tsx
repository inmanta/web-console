import React, { useState } from "react";
import {
  Button,
  Divider,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  Stack,
  StackItem,
  TextInput,
  Title,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { EventType, RangeOperator, toggleValueInList } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { Filter } from "@/Slices/Events/Core/Types";
import { FilterDrawerPanelContent, MultiTextSelect } from "@/UI/Components";
import { TimestampPicker } from "@/UI/Components/Filters";
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
  const [versionInput, setVersionInput] = useState("");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

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
  const applyVersionFilter = () => {
    const trimmed = versionInput.trim();

    if (!trimmed) {
      return;
    }

    setFilter({ ...filter, version: uniq([...(filter.version ?? []), trimmed]) });
    setVersionInput("");
  };

  const removeVersionChip = (value: string) => {
    const updated = (filter.version ?? []).filter((version) => version !== value);

    setFilter({ ...filter, version: updated.length > 0 ? updated : undefined });
  };

  const clearVersionFilters = () => setFilter({ ...filter, version: undefined });

  // --- Date ---
  const applyDateFromFilter = () => {
    if (!from) {
      return;
    }

    const updated = [
      ...(filter.timestamp ?? []).filter((entry) => entry.operator !== RangeOperator.Operator.From),
      { date: from, operator: RangeOperator.Operator.From },
    ];

    setFilter({ ...filter, timestamp: updated });
    setFrom(undefined);
  };

  const applyDateToFilter = () => {
    if (!to) {
      return;
    }

    const updated = [
      ...(filter.timestamp ?? []).filter((entry) => entry.operator !== RangeOperator.Operator.To),
      { date: to, operator: RangeOperator.Operator.To },
    ];

    setFilter({ ...filter, timestamp: updated });
    setTo(undefined);
  };

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
            <FormGroup label={words("events.filters.version.label")}>
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    value={versionInput}
                    onChange={(_event, value) => setVersionInput(value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyVersionFilter();
                      }
                    }}
                    type="number"
                    placeholder={words("events.filters.version.placeholder")}
                    aria-label="VersionFilterInput"
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <Button
                    variant="control"
                    onClick={applyVersionFilter}
                    isDisabled={!versionInput.trim()}
                    aria-label="Apply version filter"
                  >
                    <PlusIcon />
                  </Button>
                </InputGroupItem>
              </InputGroup>
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("events.column.date")}>
              <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
                <FlexItem>
                  <FormGroup label={words("events.filters.from")}>
                    <TimestampPicker
                      timestamp={from}
                      onChange={setFrom}
                      from={undefined}
                      datePickerLabel="From Date Picker"
                      timePickerLabel="From Time Picker"
                      action={
                        <Button
                          variant="control"
                          onClick={applyDateFromFilter}
                          isDisabled={!from}
                          aria-label="Apply date from filter"
                        >
                          <PlusIcon />
                        </Button>
                      }
                    />
                  </FormGroup>
                </FlexItem>
                <FlexItem>
                  <FormGroup label={words("events.filters.to")}>
                    <TimestampPicker
                      timestamp={to}
                      onChange={setTo}
                      from={from}
                      datePickerLabel="To Date Picker"
                      timePickerLabel="To Time Picker"
                      action={
                        <Button
                          variant="control"
                          onClick={applyDateToFilter}
                          isDisabled={!to}
                          aria-label="Apply date to filter"
                        >
                          <PlusIcon />
                        </Button>
                      }
                    />
                  </FormGroup>
                </FlexItem>
              </Flex>
            </FormGroup>
          </StackItem>
        </Form>

        <Divider />

        <StackItem>
          <Flex
            justifyContent={{ default: "justifyContentSpaceBetween" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            <FlexItem>
              <Title headingLevel="h3" size="md">
                {words("resources.filters.active.title")}
              </Title>
            </FlexItem>
            <FlexItem>
              <Button variant="link" isInline onClick={clearAllFilters}>
                {words("resources.filters.active.resetFilters")}
              </Button>
            </FlexItem>
          </Flex>

          {hasActiveFilters ? (
            <Stack hasGutter style={{ padding: "1rem 0" }}>
              {(filter.event_type?.length ?? 0) > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("events.column.eventType")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearEventTypeFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("events.column.eventType")
                    )}
                  >
                    {(filter.event_type ?? []).map((eventType) => (
                      <Label
                        key={eventType}
                        color="grey"
                        onClose={() => removeEventTypeChip(eventType)}
                      >
                        {eventType}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
              {(filter.source?.length ?? 0) > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("events.column.sourceState")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearSourceFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("events.column.sourceState")
                    )}
                  >
                    {(filter.source ?? []).map((source) => (
                      <Label key={source} color="grey" onClose={() => removeSourceChip(source)}>
                        {source}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
              {(filter.destination?.length ?? 0) > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("events.column.destinationState")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearDestinationFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("events.column.destinationState")
                    )}
                  >
                    {(filter.destination ?? []).map((destination) => (
                      <Label
                        key={destination}
                        color="grey"
                        onClose={() => removeDestinationChip(destination)}
                      >
                        {destination}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
              {(filter.version?.length ?? 0) > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("events.filters.version.label")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearVersionFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("events.filters.version.label")
                    )}
                  >
                    {(filter.version ?? []).map((version) => (
                      <Label key={version} color="grey" onClose={() => removeVersionChip(version)}>
                        {version}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
              {timestampChips.length > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("events.column.date")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearTimestampFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("events.column.date")
                    )}
                  >
                    {timestampChips.map((chip) => (
                      <Label
                        key={chip.label}
                        color="grey"
                        onClose={() => removeTimestampChip(chip.operator)}
                      >
                        {chip.label}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
            </Stack>
          ) : (
            <EmptyState variant="xs">
              <Title headingLevel="h4" size="md">
                {words("resources.filters.active.empty.title")}
              </Title>
              <EmptyStateBody>{words("resources.filters.active.empty.body.noTabs")}</EmptyStateBody>
            </EmptyState>
          )}
        </StackItem>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
