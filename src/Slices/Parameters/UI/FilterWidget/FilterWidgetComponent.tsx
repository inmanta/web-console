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
import { RangeOperator } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { Filter } from "@/Slices/Parameters/Core/Types";
import { CustomDatePresenter } from "@/UI";
import { FilterDrawerPanelContent } from "@/UI/Components";
import { TimestampPicker } from "@/UI/Components/Filters";
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
  const [nameInput, setNameInput] = useState("");
  const [sourceInput, setSourceInput] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // --- Name ---
  const addName = () => {
    const value = nameInput.trim();

    if (!value) {
      return;
    }
    setFilter({ ...filter, name: uniq([...(filter.name ?? []), value]) });
    setNameInput("");
  };

  const removeNameChip = (value: string) => {
    const updated = (filter.name ?? []).filter((n) => n !== value);

    setFilter({ ...filter, name: updated.length > 0 ? updated : undefined });
  };

  const clearNameFilters = () => setFilter({ ...filter, name: undefined });

  // --- Source ---
  const addSource = () => {
    const value = sourceInput.trim();

    if (!value) {
      return;
    }
    setFilter({ ...filter, source: uniq([...(filter.source ?? []), value]) });
    setSourceInput("");
  };

  const removeSourceChip = (value: string) => {
    const updated = (filter.source ?? []).filter((s) => s !== value);

    setFilter({ ...filter, source: updated.length > 0 ? updated : undefined });
  };

  const clearSourceFilters = () => setFilter({ ...filter, source: undefined });

  // --- Updated (date range) ---
  const applyDateFromFilter = () => {
    if (!dateFrom) {
      return;
    }
    const updated = [
      ...(filter.updated ?? []).filter((d) => d.operator !== RangeOperator.Operator.From),
      { date: dateFrom, operator: RangeOperator.Operator.From },
    ];

    setFilter({ ...filter, updated });
    setDateFrom(undefined);
  };

  const applyDateToFilter = () => {
    if (!dateTo) {
      return;
    }
    const updated = [
      ...(filter.updated ?? []).filter((d) => d.operator !== RangeOperator.Operator.To),
      { date: dateTo, operator: RangeOperator.Operator.To },
    ];

    setFilter({ ...filter, updated });
    setDateTo(undefined);
  };

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
            <FormGroup label={words("parameters.columns.name")}>
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    value={nameInput}
                    onChange={(_e, val) => setNameInput(val)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addName();
                      }
                    }}
                    placeholder={words("parameters.filters.name.placeholder")}
                    aria-label="Name filter"
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <Button
                    type="button"
                    variant="control"
                    onClick={addName}
                    isDisabled={!nameInput}
                    aria-label="Apply name filter"
                  >
                    <PlusIcon />
                  </Button>
                </InputGroupItem>
              </InputGroup>
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("parameters.columns.source")}>
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    value={sourceInput}
                    onChange={(_e, val) => setSourceInput(val)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSource();
                      }
                    }}
                    placeholder={words("parameters.filters.source.placeholder")}
                    aria-label="Source filter"
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <Button
                    type="button"
                    variant="control"
                    onClick={addSource}
                    isDisabled={!sourceInput}
                    aria-label="Apply source filter"
                  >
                    <PlusIcon />
                  </Button>
                </InputGroupItem>
              </InputGroup>
            </FormGroup>
          </StackItem>

          <StackItem>
            <FormGroup label={words("parameters.columns.updated")}>
              <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
                <FlexItem>
                  <FormGroup label={words("parameters.filters.from")}>
                    <TimestampPicker
                      timestamp={dateFrom}
                      onChange={setDateFrom}
                      from={undefined}
                      datePickerLabel="From Date Picker"
                      timePickerLabel="From Time Picker"
                      action={
                        <Button
                          variant="control"
                          onClick={applyDateFromFilter}
                          isDisabled={!dateFrom}
                          aria-label="Apply date from filter"
                        >
                          <PlusIcon />
                        </Button>
                      }
                    />
                  </FormGroup>
                </FlexItem>
                <FlexItem>
                  <FormGroup label={words("parameters.filters.to")}>
                    <TimestampPicker
                      timestamp={dateTo}
                      onChange={setDateTo}
                      from={dateFrom}
                      datePickerLabel="To Date Picker"
                      timePickerLabel="To Time Picker"
                      action={
                        <Button
                          variant="control"
                          onClick={applyDateToFilter}
                          isDisabled={!dateTo}
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
              {(filter.name ?? []).length > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("parameters.columns.name")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearNameFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("parameters.columns.name")
                    )}
                  >
                    {(filter.name ?? []).map((name) => (
                      <Label key={name} color="grey" onClose={() => removeNameChip(name)}>
                        {name}
                      </Label>
                    ))}
                  </LabelGroup>
                </StackItem>
              )}
              {(filter.source ?? []).length > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("parameters.columns.source")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearSourceFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("parameters.columns.source")
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
              {updatedChips.length > 0 && (
                <StackItem>
                  <LabelGroup
                    categoryName={words("parameters.columns.updated")}
                    isCompact
                    isClosable
                    isEditable
                    onClick={clearUpdatedFilters}
                    closeBtnAriaLabel={words("resources.filters.active.group.close")(
                      words("parameters.columns.updated")
                    )}
                  >
                    {updatedChips.map((chip) => (
                      <Label key={chip} color="grey" onClose={() => removeUpdatedChip(chip)}>
                        {chip}
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
